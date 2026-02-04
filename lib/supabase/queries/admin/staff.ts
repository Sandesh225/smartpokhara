import { SupabaseClient } from "@supabase/supabase-js";
import { AdminStaffListItem, CreateStaffInput, StaffFiltersState } from "@/types/admin-staff";

export const adminStaffQueries = {
  /**
   * Fetch all staff using the RPC for optimized joining
   */
  async getAllStaff(client: SupabaseClient, filters: StaffFiltersState) {
    let query = client
      .from("staff_profiles")
      .select(
        `
      *,
      user:users!staff_profiles_user_id_fkey (email, profile:user_profiles (full_name, profile_photo_url)),
      department:departments (name),
      ward:wards (ward_number)
    `
      )
      .eq("is_active", filters.status === "active");

    // SERVER-SIDE FILTERING (Critical for Security & Performance)
    if (filters.department_id) {
      query = query.eq("department_id", filters.department_id);
    }
    if (filters.ward_id) {
      query = query.eq("ward_id", filters.ward_id);
    }
    if (filters.role && filters.role !== "all") {
      query = query.eq("staff_role", filters.role);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map((staff: any) => {
      const user = staff.user;
      const profile = Array.isArray(user?.profile)
        ? user.profile[0]
        : user?.profile;
      return {
        ...staff,
        full_name: profile?.full_name || user?.email || "Unknown Staff",
        avatar_url: profile?.profile_photo_url,
        email: user?.email,
        department_name: staff.department?.name || "Unassigned",
        ward_num: staff.ward?.ward_number || "N/A",
      };
    });
  },
  /**
   * Get detailed profile for a single staff member
   */
  async getStaffById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("staff_profiles")
      .select(
        `
        *,
        user:users!staff_profiles_user_id_fkey(email, phone),
        profile:user_profiles!staff_profiles_user_profile_fkey(
          full_name, 
          profile_photo_url, 
          address_line1
        ),
        department:departments(name, id),
        ward:wards(name, ward_number, id)
      `
      )
      .eq("user_id", id)
      .maybeSingle();

    if (error) {
      console.error("Database Query Error:", error.message);
      return null;
    }

    return data;
  },
  /**
   * Create a new staff member (Uses the secure RPC)
   */
  async createStaff(client: SupabaseClient, input: CreateStaffInput) {
    const { data, error } = await client.rpc("rpc_register_staff", {
      p_email: input.email,
      p_full_name: input.full_name,
      p_staff_role: input.staff_role,
      p_phone: input.phone,
      p_department_id: input.department_id || null,
      p_ward_id: input.ward_id || null,
      p_is_supervisor: input.is_supervisor,
      p_specializations: input.specializations || [],
      p_employment_date: new Date().toISOString().split("T")[0],
    });

    if (error) throw error;
    return data;
  },

  /**
   * Update staff details
   */
  async updateStaff(client: SupabaseClient, id: string, updates: any) {
    const { error } = await client.rpc("rpc_update_staff_role", {
      p_user_id: id,
      p_staff_role: updates.staff_role,
      p_department_id: updates.department_id,
      p_ward_id: updates.ward_id,
      p_is_supervisor: updates.is_supervisor,
      p_is_active: updates.is_active,
    });
    if (error) throw error;
  },

  /**
   * Get attendance logs
   */
  async getStaffAttendance(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("staff_attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .order("date", { ascending: false })
      .limit(30);

    if (error) throw error;
    return data;
  },

  /**
   * Get workload statistics (Top busiest)
   */
  async getStaffWorkload(client: SupabaseClient) {
    // Use MV for performance
    const { data, error } = await client
      .from("mv_staff_performance")
      .select(
        `
        user_id,
        full_name,
        current_workload,
        staff_role
      `
      )
      .order("current_workload", { ascending: false })
      .limit(10);

    if (error) throw error;

    // We might need to join user_profiles to get avatar_url if not in MV
    // But for now return what we have
    return data;
  },

  /**
   * Get performance metrics for one or all staff
   */
  async getStaffPerformance(client: SupabaseClient, staffId?: string) {
    let query = client.from("mv_staff_performance").select("*");

    if (staffId) {
      query = query.eq("user_id", staffId).single();
    } else {
      query = query.order("resolved_complaints", { ascending: false });
    }

    const { data, error } = await query;
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },
  async getStaffForSelection(client: SupabaseClient) {
    const { data, error } = await client
      .from("staff_profiles")
      .select(
        `
        user_id,
        staff_code,
        staff_role,
        user:users!staff_profiles_user_id_fkey (
          email,
          profile:user_profiles (
            full_name
          )
        )
      `
      )
      .eq("is_active", true);

    if (error) {
      console.error("Staff selection fetch error:", error);
      throw new Error(error.message);
    }

    // MAP & UNWRAP: Handle the nested array structure from Supabase
    return (data || []).map((s: any) => {
      // Supabase returns 1-to-1 joins as an array of 1 item sometimes
      const profile = Array.isArray(s.user?.profile)
        ? s.user.profile[0]
        : s.user?.profile;

      return {
        user_id: s.user_id,
        full_name: profile?.full_name || s.user?.email || "Unknown Name",
        staff_code: s.staff_code || "N/A",
        role: s.staff_role,
      };
    });
  },
};