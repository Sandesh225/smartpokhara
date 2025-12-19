import { SupabaseClient } from "@supabase/supabase-js";
import type { StaffProfile } from "@/lib/types/supervisor.types";

export const supervisorStaffQueries = {
  /**
   * Fetches team members strictly matching the supervisor's Respected Wards or Departments.
   */
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
      .neq("user_id", supervisorId); // Exclude self

    // 3. Apply Isolation by Respected IDs
    if (!isSenior) {
      const orParts = [];
      if (wards.length > 0) orParts.push(`ward_id.in.(${wards.join(",")})`);
      if (depts.length > 0)
        orParts.push(`department_id.in.(${depts.join(",")})`);

      if (orParts.length > 0) {
        query = query.or(orParts.join(","));
      } else {
        // If supervisor has no assignments, return empty team
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

    return staffData.map((s: any) => {
      const p = profileMap.get(s.user_id);
      const u = userMap.get(s.user_id);
      return {
        ...s,
        full_name: p?.full_name || u?.email?.split("@")[0] || "Staff member",
        avatar_url: p?.profile_photo_url,
        email: u?.email,
        phone: u?.phone,
        role: s.staff_role,
      };
    });
  },
};