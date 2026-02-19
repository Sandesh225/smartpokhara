import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { Ward, Department, CategoryWithSubcategories, ComplaintSubcategory, SLAConfig, SystemSetting, MaintenanceModeInput, ComplaintCategory } from "./types";

type Client = SupabaseClient<Database>;

export const lookupApi = {
  async getCategories(client: Client) {
    const { data, error } = await (client as any)
      .from("complaint_categories")
      .select(`
        *,
        subcategories:complaint_subcategories(*)
      `)
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    return data as CategoryWithSubcategories[];
  },

  async getSubcategories(client: Client, categoryId: string) {
    const { data, error } = await (client as any)
      .from("complaint_subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("name", { ascending: true });
    
    if (error) throw error;
    return data as ComplaintSubcategory[];
  },

  async getWards(client: Client) {
    const { data, error } = await (client as any)
      .from("wards")
      .select("*")
      .order("ward_number", { ascending: true });
    if (error) throw error;
    return data as Ward[];
  },

  async getDepartments(client: Client) {
    const { data, error } = await (client as any)
      .from("departments")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return data as Department[];
  },

  async getSLAConfigs(client: Client) {
    const { data, error } = await (client as any)
      .from("sla_configurations")
      .select(`
        *,
        category:complaint_categories(name),
        department:departments(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as SLAConfig[];
  },

  async getSystemSettings(client: Client) {
    const { data, error } = await (client as any).rpc("rpc_manage_system_settings", { p_action: "get" });
    if (error) throw error;
    return data as SystemSetting[];
  },

  async upsertCategory(client: Client, category: Partial<ComplaintCategory>) {
    const { data, error } = await (client as any)
      .from("complaint_categories")
      .upsert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(client: Client, id: string) {
    const { error } = await (client as any).from("complaint_categories").delete().eq("id", id);
    if (error) throw error;
  },

  async upsertSLAConfig(client: Client, config: Partial<SLAConfig>) {
    const { data, error } = await (client as any)
      .from("sla_configurations")
      .upsert(config)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSystemSetting(client: Client, key: string, value: any, category: string = 'general') {
    const { error } = await (client as any).rpc("rpc_manage_system_settings", {
      p_action: "set",
      p_key: key,
      p_value: value,
      p_category: category
    });
    if (error) throw error;
  },

  async toggleMaintenanceMode(client: Client, input: MaintenanceModeInput) {
    const { error } = await (client as any)
      .from("system_maintenance")
      .insert({
        maintenance_type: "scheduled",
        title: input.title || "Scheduled Maintenance",
        description: input.description || "Manual maintenance mode trigger",
        scheduled_start: new Date().toISOString(),
        scheduled_end: input.scheduled_end || new Date(Date.now() + 3600000).toISOString(),
        is_active: input.is_active,
        status: input.is_active ? "in_progress" : "completed"
      });
      
    if (error) throw error;
  }
};
