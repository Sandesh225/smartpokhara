import { SupabaseClient } from "@supabase/supabase-js";
import type { StaffProfile } from "@/lib/types/supervisor.types";

export const supervisorStaffQueries = {
  /**
   * 1. GET SUPERVISED STAFF
   * Fetches team members based on Supervisor's Ward/Dept jurisdiction.
   */
  async getSupervisedStaff(
    client: SupabaseClient,
    supervisorId: string
  ): Promise<StaffProfile[]> {
    // A. Get Scope
    const { data: scope } = await client
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", supervisorId)
      .single();

    if (!scope) return [];

    const isSenior = scope.supervisor_level === "senior";

    // B. Query Staff
    let query = client
      .from("staff_profiles")
      .select(
        `user_id, staff_code, department_id, ward_id, staff_role, is_active,
         availability_status, current_workload, max_concurrent_assignments, performance_rating`
      )
      .eq("is_active", true)
      .neq("user_id", supervisorId);

    // C. Apply Jurisdiction Filters (if not Senior)
    if (!isSenior) {
      const filters = [];
      if (scope.assigned_wards?.length > 0) {
        filters.push(`ward_id.in.(${scope.assigned_wards.join(",")})`);
      }
      if (scope.assigned_departments?.length > 0) {
        filters.push(
          `department_id.in.(${scope.assigned_departments.join(",")})`
        );
      }

      if (filters.length > 0) {
        query = query.or(filters.join(","));
      } else {
        return [];
      }
    }

    const { data: staffData, error } = await query;
    if (error || !staffData) return [];

    // D. Hydrate User Details (Name, Avatar, Email)
    const userIds = staffData.map((s) => s.user_id);
    const [profilesRes, usersRes] = await Promise.all([
      client
        .from("user_profiles")
        .select("user_id, full_name, profile_photo_url")
        .in("user_id", userIds),
      client.from("users").select("id, email, phone").in("id", userIds),
    ]);

    const profileMap = new Map(
      (profilesRes.data || []).map((p) => [p.user_id, p])
    );
    const userMap = new Map((usersRes.data || []).map((u) => [u.id, u]));

    return staffData.map((s: any) => ({
      ...s,
      full_name: profileMap.get(s.user_id)?.full_name || "Staff Member",
      avatar_url: profileMap.get(s.user_id)?.profile_photo_url,
      email: userMap.get(s.user_id)?.email,
      phone: userMap.get(s.user_id)?.phone,
      role: s.staff_role,
    }));
  },

  /**
   * 2. GET STAFF ASSIGNMENTS (For Details Page & Workload Cards)
   */
  async getTeamAssignments(client: SupabaseClient, staffIds: string[]) {
    // Fetch Complaints
    const { data: complaints } = await client
      .from("staff_work_assignments")
      .select(
        `
        id, staff_id, assignment_status, priority, due_at,
        complaint:complaints(id, tracking_code, title)
      `
      )
      .in("staff_id", staffIds)
      .neq("assignment_status", "completed");

    // Map to Unified Structure
    return (complaints || []).map((c: any) => ({
      id: c.id,
      staffId: c.staff_id,
      type: "complaint",
      label: c.complaint?.tracking_code || "INCIDENT",
      title: c.complaint?.title || "Untitled Issue",
      priority: c.priority,
      status: c.assignment_status,
      deadline: c.due_at,
    }));
  },

  /**
   * 3. GET STAFF DETAILS (Single Profile)
   */
  async getStaffById(client: SupabaseClient, staffId: string) {
    const { data: staff, error } = await client
      .from("staff_profiles")
      .select(
        `
        *,
        ward:wards(id, ward_number, name),
        department:departments(name)
      `
      )
      .eq("user_id", staffId)
      .single();

    if (error || !staff) return null;

    const { data: profile } = await client
      .from("user_profiles")
      .select("full_name, profile_photo_url")
      .eq("user_id", staffId)
      .single();

    const { data: user } = await client
      .from("users")
      .select("email, phone")
      .eq("id", staffId)
      .single();

    return {
      ...staff,
      full_name: profile?.full_name || "Unknown Staff",
      avatar_url: profile?.profile_photo_url,
      email: user?.email,
      phone: user?.phone,
      role: staff.staff_role,
      ward_number: staff.ward?.ward_number,
      ward_name: staff.ward?.name,
    };
  },
  async getStaffPerformance(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("staff_work_assignments")
      .select(
        `
        id, created_at, completed_at, due_at,
        complaint:complaints(sla_due_at)
      `
      )
      .eq("staff_id", staffId)
      .eq("assignment_status", "completed");

    if (error) return { resolved: [] };

    return {
      resolved: data.map((item) => ({
        submitted_at: item.created_at,
        resolved_at: item.completed_at,
        sla_due_at: item.complaint?.sla_due_at || item.due_at,
      })),
    };
  },
  /**
   * 4. LEAVE & ATTENDANCE MANAGEMENT
   */
  async getPendingLeaves(client: SupabaseClient, staffIds: string[]) {
    const { data, error } = await client
      .from("leave_requests")
      .select("*")
      .in("staff_id", staffIds)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) return [];
    return data;
  },

  async approveLeave(
    client: SupabaseClient,
    leaveId: string,
    supervisorId: string
  ) {
    const { error } = await client
      .from("leave_requests")
      .update({
        status: "approved",
        approved_by: supervisorId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leaveId);

    if (error) throw error;
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
        approved_by: supervisorId, // Tracks who rejected it
        updated_at: new Date().toISOString(),
      })
      .eq("id", leaveId);

    if (error) throw error;
  },
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
      .neq("assignment_status", "completed");

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
};