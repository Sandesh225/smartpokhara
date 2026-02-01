import { SupabaseClient } from "@supabase/supabase-js";
import type { StaffProfile } from "@/lib/types/supervisor.types";

export const supervisorStaffQueries = {
  /**
   * 1. GET SUPERVISED STAFF LIST
   * Returns basic profile info for all staff under this supervisor
   */
  async getSupervisedStaff(
    client: SupabaseClient,
    supervisorId: string
  ): Promise<StaffProfile[]> {
    const { data: scope } = await client
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", supervisorId)
      .single();

    if (!scope) return [];

    let query = client
      .from("staff_profiles")
      .select(
        `user_id, staff_code, department_id, ward_id, staff_role, is_active,
         availability_status, current_workload, max_concurrent_assignments, performance_rating`
      )
      .eq("is_active", true)
      .neq("user_id", supervisorId);

    if (scope.supervisor_level !== "senior") {
      const filters = [];
      if (scope.assigned_wards?.length)
        filters.push(`ward_id.in.(${scope.assigned_wards.join(",")})`);
      if (scope.assigned_departments?.length)
        filters.push(
          `department_id.in.(${scope.assigned_departments.join(",")})`
        );

      if (filters.length > 0) query = query.or(filters.join(","));
      else return [];
    }

    const { data: staffData } = await query;
    if (!staffData) return [];

    const userIds = staffData.map((s) => s.user_id);
    const [profiles, users] = await Promise.all([
      client
        .from("user_profiles")
        .select("user_id, full_name, profile_photo_url")
        .in("user_id", userIds),
      client.from("users").select("id, email, phone").in("id", userIds),
    ]);

    const pMap = new Map(profiles.data?.map((p) => [p.user_id, p]));
    const uMap = new Map(users.data?.map((u) => [u.id, u]));

    return staffData.map((s: any) => ({
      ...s,
      full_name: pMap.get(s.user_id)?.full_name || "Staff Member",
      avatar_url: pMap.get(s.user_id)?.profile_photo_url,
      email: uMap.get(s.user_id)?.email,
      phone: uMap.get(s.user_id)?.phone,
      role: s.staff_role,
    }));
  },

  /**
   * 2. ATTENDANCE OVERVIEW (Hub Page)
   * Returns staff list merged with today's attendance logs
   */
  async getStaffAttendanceOverview(
    client: SupabaseClient,
    supervisorId: string
  ) {
    const staff = await this.getSupervisedStaff(client, supervisorId);
    if (!staff.length) return [];

    const staffIds = staff.map((s) => s.user_id);
    const today = new Date().toISOString().split("T")[0];

    const { data: logs } = await client
      .from("attendance_logs")
      .select("*")
      .in("staff_id", staffIds)
      .eq("date", today);

    const logMap = new Map(logs?.map((l) => [l.staff_id, l]));

    return staff.map((s) => {
      const log = logMap.get(s.user_id);
      let status = "absent"; // Default

      if (log) {
        if (log.check_out_time) status = "checked_out";
        else if (log.check_in_time) status = "on_duty";
      }
      // You could also check if they are on approved leave here

      return {
        ...s,
        attendance: log || null,
        computedStatus: status,
      };
    });
  },
  /**
   * 3. PENDING LEAVES (Hub Page)
   */
  async getPendingLeaves(client: SupabaseClient, staffIds: string[]) {
    if (!staffIds.length) return [];

    const { data, error } = await client
      .from("leave_requests")
      .select(
        `
        *,
        staff:users!leave_requests_staff_id_fkey(
           profile:user_profiles(full_name, profile_photo_url)
        )
      `
      )
      .in("staff_id", staffIds)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching leaves:", error);
      return [];
    }

    return data.map((l: any) => ({
      id: l.id,
      staffId: l.staff_id,
      staffName: l.staff?.profile?.full_name || "Unknown Staff",
      staffAvatar: l.staff?.profile?.profile_photo_url,
      type: l.type,
      reason: l.reason,
      startDate: l.start_date,
      endDate: l.end_date,
      status: l.status,
      createdAt: l.created_at,
    }));
  },

  /**
   * 4. SINGLE STAFF DETAILS (Detail Page)
   */
  async getStaffDetails(client: SupabaseClient, staffId: string) {
    const { data: staff } = await client
      .from("staff_profiles")
      .select(`*, ward:wards(name, ward_number), department:departments(name)`)
      .eq("user_id", staffId)
      .single();

    if (!staff) return null;

    const { data: user } = await client
      .from("user_profiles")
      .select("full_name, profile_photo_url")
      .eq("user_id", staffId)
      .single();

    const today = new Date().toISOString().split("T")[0];
    const { data: attendance } = await client
      .from("attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .eq("date", today)
      .maybeSingle();

    const { data: leaves } = await client
      .from("leave_requests")
      .select("*")
      .eq("staff_id", staffId)
      .eq("status", "pending");

    return {
      profile: {
        ...staff,
        full_name: user?.full_name,
        avatar_url: user?.profile_photo_url,
        ward_name: staff.ward ? `Ward ${staff.ward.ward_number}` : "HQ",
      },
      attendance,
      pending_leaves: leaves || [],
    };
  },

  /**
   * 5. STAFF ASSIGNMENTS (Detail Page)
   */
  async getStaffAssignments(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("staff_work_assignments")
      .select(
        `
        id, assignment_status, priority, due_at,
        complaint:complaints(id, tracking_code, title, sla_due_at),
        task:supervisor_tasks(id, tracking_code, title, due_date)
      `
      )
      .eq("staff_id", staffId)
      .neq("assignment_status", "completed")
      .order("priority", { ascending: true });

    if (error) return { complaints: [], tasks: [] };

    return {
      complaints: data
        .filter((i) => i.complaint)
        .map((i) => ({
          ...i.complaint,
          status: i.assignment_status,
          priority: i.priority,
        })),
      tasks: data
        .filter((i) => i.task)
        .map((i) => ({
          ...i.task,
          status: i.assignment_status,
          priority: i.priority,
        })),
    };
  },

  /**
   * 6. LEAVE ACTIONS (Approve/Reject)
   */
  async approveLeave(
    client: SupabaseClient,
    leaveId: string,
    supervisorId: string
  ) {
    // 1. Update Status (Trigger handles balance)
    const { error } = await client
      .from("leave_requests")
      .update({
        status: "approved",
        approved_by: supervisorId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leaveId);

    if (error) throw error;

    // 2. Optional: Create an "On Leave" attendance log for today if applicable
    // (This logic can be added if you want immediate attendance board reflection)
  },
  async rejectLeave(
    client: SupabaseClient,
    leaveId: string,
    supervisorId: string
  ) {
    const { error } = await client
      .from("leave_requests")
      .update({
        status: "rejected",
        approved_by: supervisorId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leaveId);

    if (error) throw error;
  },
};