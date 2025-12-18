import { SupabaseClient } from "@supabase/supabase-js";

export const adminDepartmentQueries = {
  async getDepartments(client: SupabaseClient) {
    const { data, error } = await client
      .from("departments")
      .select(`
        *,
        head:users!departments_head_user_id_fkey(
          profile:user_profiles(full_name)
        ),
        staff:staff_profiles(count)
      `)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async upsertDepartment(client: SupabaseClient, department: any) {
    const { data, error } = await client
      .from("departments")
      .upsert(department)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Map a category to a department for auto-assignment
  async mapCategoryToDepartment(client: SupabaseClient, categoryId: string, departmentId: string) {
    const { error } = await client
      .from("complaint_categories")
      .update({ default_department_id: departmentId })
      .eq("id", categoryId);
    
    if (error) throw error;
  }
};