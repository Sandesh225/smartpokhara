import { SupabaseClient } from "@supabase/supabase-js";
import type { StaffProfile } from "@/lib/types/supervisor.types";

export const supervisorStaffQueries = {
  /**
   * Fetches team members strictly matching the supervisor's Respected Wards or Departments.
   */
  // File: /lib/supabase/queries/supervisor-staff.ts

  // File: /lib/supabase/queries/supervisor-staff.ts

  async getSupervisedStaff(
    client: SupabaseClient,
    supervisorId: string
  ): Promise<StaffProfile[]> {
    // 1. Get Supervisor's Scope
    const { data: scope } = await client
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", supervisorId)
      .single();

    if (!scope) return [];

    const wards = scope.assigned_wards || [];
    const depts = scope.assigned_departments || [];
    const isSenior = scope.supervisor_level === "senior";

    // 2. Base Query
    let query = client
      .from("staff_profiles")
      .select(
        `
      user_id, staff_code, department_id, ward_id, staff_role, is_active,
      availability_status, current_workload, max_concurrent_assignments, performance_rating
    `
      )
      .eq("is_active", true)
      .neq("user_id", supervisorId); // This correctly hides you ("supervisor")

    // 3. Apply Isolation
    if (!isSenior) {
      const filters = [];

      // FIX: Remove double-quotes inside the join. PostgREST handles raw UUIDs.
      if (wards.length > 0) {
        filters.push(`ward_id.in.(${wards.join(",")})`);
      }
      if (depts.length > 0) {
        filters.push(`department_id.in.(${depts.join(",")})`);
      }

      if (filters.length > 0) {
        query = query.or(filters.join(","));
      } else {
        return [];
      }
    }

    const { data: staffData, error } = await query;
    if (error || !staffData) return [];

    // 4. Hydrate Profile Info (Name, Avatar, Email)
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
      full_name:
        profileMap.get(s.user_id)?.full_name ||
        userMap.get(s.user_id)?.email?.split("@")[0] ||
        "Staff",
      avatar_url: profileMap.get(s.user_id)?.profile_photo_url,
      email: userMap.get(s.user_id)?.email,
      phone: userMap.get(s.user_id)?.phone,
      role: s.staff_role,
    }));
  },
};