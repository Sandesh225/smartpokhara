import { SupabaseClient } from "@supabase/supabase-js";

export const adminWardQueries = {
  async getWards(client: SupabaseClient) {
    const { data, error } = await client
      .from("wards")
      .select(`
        id, ward_number, name, name_nepali, contact_phone, is_active,
        staff:staff_profiles(count),
        complaints:complaints(count)
      `)
      .order("ward_number", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getWardById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("wards")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWardDetails(client: SupabaseClient, id: string, updates: any) {
    const { error } = await client
      .from("wards")
      .update(updates)
      .eq("id", id);
    
    if (error) throw error;
  },

  // Note: GIS updates usually require PostGIS functions or specific format
  async updateWardBoundary(client: SupabaseClient, id: string, geoJson: any) {
    // Assuming backend trigger or PostGIS cast handles JSON -> Geometry
    const { error } = await client
      .from("wards")
      .update({ area_geometry: geoJson }) 
      .eq("id", id);
    
    if (error) throw error;
  }
};