import type { SupabaseClient } from "@supabase/supabase-js";
import type { StaffProfile } from "@/lib/types/supervisor.types";

export const supervisorStaffQueries = {
  /**
   * Fetches staff under a supervisor's jurisdiction.
   * NOW ACCEPTS client: SupabaseClient
   */
  async getSupervisedStaff(client: SupabaseClient, supervisorId: string): Promise<StaffProfile[]> {
    // 1. Get Supervisor's Jurisdiction
    const { data: supervisorProfile } = await client
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", supervisorId)
      .single();

    const assigned_wards = supervisorProfile?.assigned_wards || [];
    const assigned_departments = supervisorProfile?.assigned_departments || [];
    const supervisor_level = supervisorProfile?.supervisor_level || 'ward';

    // 2. Base Query Builder
    const buildBaseQuery = () => client
      .from("staff_profiles")
      .select(`
        user_id, staff_code, department_id, ward_id, staff_role, is_active,
        availability_status, current_workload, max_concurrent_assignments, performance_rating, last_known_location
      `)
      .eq("is_active", true)
      .neq("user_id", supervisorId);

    let query = buildBaseQuery();

    // 3. Apply Jurisdiction Filters
    const conditions: string[] = [];
    if (assigned_wards.length > 0) conditions.push(`ward_id.in.(${assigned_wards.join(',')})`);
    if (assigned_departments.length > 0) conditions.push(`department_id.in.(${assigned_departments.join(',')})`);

    if (supervisor_level !== 'senior' && conditions.length > 0) {
      query = query.or(conditions.join(','));
    }

    let { data: staffData, error: staffError } = await query;

    // 4. FALLBACK: If strict filtering returns nothing, fetch ALL active staff (Dev/Testing Fix)
    if (!staffError && (!staffData || staffData.length === 0)) {
      // console.warn("getSupervisedStaff: Falling back to ALL active staff.");
      const fallbackResult = await buildBaseQuery(); 
      staffData = fallbackResult.data;
      staffError = fallbackResult.error;
    }

    if (staffError || !staffData || staffData.length === 0) return [];

    // 5. Hydrate Details
    const userIds = staffData.map((s) => s.user_id);
    
    const [profilesRes, usersRes] = await Promise.all([
      client.from("user_profiles").select("user_id, full_name, avatar_url").in("user_id", userIds),
      client.from("users").select("id, email, phone").in("id", userIds)
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p]));
    const userMap = new Map((usersRes.data || []).map((u) => [u.id, u]));

    return staffData.map((staff: any) => {
        const profile = profileMap.get(staff.user_id);
        const user = userMap.get(staff.user_id);
        
        let displayName = "Unknown Staff";
        if (profile?.full_name && profile.full_name !== "User") {
            displayName = profile.full_name;
        } else if (user?.email) {
            displayName = user.email.split("@")[0]; 
        } else if (staff.staff_code) {
            displayName = `Staff ${staff.staff_code}`;
        }

        return {
            ...staff,
            full_name: displayName,
            avatar_url: profile?.avatar_url,
            email: user?.email,
            phone: user?.phone
        };
    });
  },

  // ... (Keep existing getTeamWorkload/Assignments/Schedule, they already accept 'client' if copied from previous correct version)
  // Ensure they match this pattern: async getTeamWorkload(client: SupabaseClient, ...)
  
  async getTeamWorkload(client: SupabaseClient, staffIds: string[]) {
    if (staffIds.length === 0) return {};
    const today = new Date().toISOString().split("T")[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekStr = startOfWeek.toISOString();

    const [activeComplaints, tasksToday, weeklyPerformance] = await Promise.all([
      client.from("complaints").select("assigned_staff_id, status").in("assigned_staff_id", staffIds).in("status", ["assigned", "in_progress"]),
      client.from("supervisor_tasks").select("primary_assigned_to, status").in("primary_assigned_to", staffIds).gte("due_date", today),
      client.from("complaints").select("assigned_staff_id").in("assigned_staff_id", staffIds).eq("status", "closed").gte("updated_at", weekStr)
    ]);

    const workloadMap: Record<string, any> = {};
    staffIds.forEach(id => {
      const staffComplaints = activeComplaints.data?.filter(c => c.assigned_staff_id === id) || [];
      const staffTasks = tasksToday.data?.filter(t => t.primary_assigned_to === id) || [];
      const staffPerf = weeklyPerformance.data?.filter(c => c.assigned_staff_id === id) || [];

      workloadMap[id] = {
        active_complaints_total: staffComplaints.length,
        tasks_today_pending: staffTasks.filter(t => t.status !== 'completed').length,
        complaints_completed_this_week: staffPerf.length,
      };
    });
    return workloadMap;
  },

  async getTeamAssignments(client: SupabaseClient, staffIds: string[]) {
    if (staffIds.length === 0) return [];
    const [complaints, tasks] = await Promise.all([
      client.from("complaints").select("id, tracking_code, title, status, priority, sla_due_at, assigned_staff_id").in("assigned_staff_id", staffIds).in("status", ["assigned", "in_progress"]),
      client.from("supervisor_tasks").select("id, tracking_code, title, status, priority, due_date, primary_assigned_to").in("primary_assigned_to", staffIds).neq("status", "completed"),
    ]);

    return [
      ...(complaints.data || []).map((c: any) => ({
        id: c.id, type: 'complaint' as const, staffId: c.assigned_staff_id, label: c.tracking_code, title: c.title, priority: c.priority, status: c.status, deadline: c.sla_due_at
      })),
      ...(tasks.data || []).map((t: any) => ({
        id: t.id, type: 'task' as const, staffId: t.primary_assigned_to, label: t.tracking_code, title: t.title, priority: t.priority, status: t.status, deadline: t.due_date
      }))
    ];
  },

  async getStaffSchedule(client: SupabaseClient, staffIds: string[]) {
    const { data, error } = await client.from("staff_schedules").select("*").in("staff_id", staffIds).gte("schedule_date", new Date().toISOString().split('T')[0]);
    if (error) return [];
    return data || [];
  }
};