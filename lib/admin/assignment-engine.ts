import { SupabaseClient } from "@supabase/supabase-js";

export const assignmentEngine = {
  /**
   * Suggest a department based on complaint category
   */
  async suggestDepartment(client: SupabaseClient, categoryId: string) {
    const { data } = await client
      .from("complaint_categories")
      .select("default_department_id, departments(name)")
      .eq("id", categoryId)
      .single();
    
    return data?.departments ? { id: data.default_department_id, name: data.departments.name } : null;
  },

  /**
   * Find available staff in a specific ward/department
   */
  async findAvailableStaff(client: SupabaseClient, wardId: string | null, departmentId: string | null) {
    let query = client
      .from("staff_profiles")
      .select(`
        user_id, staff_code, current_workload, 
        user:users(profile:user_profiles(full_name, avatar_url))
      `)
      .eq("is_active", true)
      .lt("current_workload", 10) // Mock threshold
      .order("current_workload", { ascending: true });

    if (wardId) query = query.eq("ward_id", wardId);
    if (departmentId) query = query.eq("department_id", departmentId);

    const { data } = await query;
    return data || [];
  }
};