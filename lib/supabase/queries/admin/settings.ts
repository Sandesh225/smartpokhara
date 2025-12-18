import { SupabaseClient } from "@supabase/supabase-js";

export const adminSettingsQueries = {
  // --- CATEGORIES ---
  async getCategories(client: SupabaseClient) {
    const { data, error } = await client
      .from("complaint_categories")
      .select(`
        *,
        subcategories:complaint_subcategories(*)
      `)
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async upsertCategory(client: SupabaseClient, category: any) {
    const { data, error } = await client
      .from("complaint_categories")
      .upsert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCategory(client: SupabaseClient, id: string) {
    const { error } = await client.from("complaint_categories").delete().eq("id", id);
    if (error) throw error;
  },

  // --- SLA CONFIGURATION ---
  async getSLAConfigs(client: SupabaseClient) {
    const { data, error } = await client
      .from("sla_configurations")
      .select(`
        *,
        category:complaint_categories(name),
        department:departments(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async upsertSLAConfig(client: SupabaseClient, config: any) {
    const { data, error } = await client
      .from("sla_configurations")
      .upsert(config)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- SYSTEM SETTINGS ---
  async getSystemSettings(client: SupabaseClient) {
    // Uses the RPC to safely get settings
    const { data, error } = await client.rpc("rpc_manage_system_settings", { p_action: "get" });
    if (error) throw error;
    return data;
  },

  async updateSystemSetting(client: SupabaseClient, key: string, value: any, category: string = 'general') {
    const { error } = await client.rpc("rpc_manage_system_settings", {
      p_action: "set",
      p_key: key,
      p_value: value,
      p_category: category
    });
    if (error) throw error;
  },

  async toggleMaintenanceMode(client: SupabaseClient, isActive: boolean, title: string = "Scheduled Maintenance") {
    const { error } = await client
      .from("system_maintenance")
      .insert({
        maintenance_type: "scheduled",
        title: title,
        description: "Manual maintenance mode trigger",
        scheduled_start: new Date().toISOString(),
        scheduled_end: new Date(Date.now() + 3600000).toISOString(), // +1 hour default
        is_active: isActive,
        status: isActive ? "in_progress" : "completed"
      });
      
    if (error) throw error;
  }
};