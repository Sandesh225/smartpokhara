import { SupabaseClient } from "@supabase/supabase-js";
import { AdminStaffListItem, CreateStaffInput, StaffFiltersState } from "@/types/admin-staff";

export const adminStaffQueries = {
  /**
   * Fetch all staff using the RPC for optimized joining
   */
  async getAllStaff(client: SupabaseClient, filters?: StaffFiltersState) {
    // RPC call to get staff list with details
    let query = client.rpc("rpc_get_all_staff", {
      p_department_id: filters?.department_id || null,
      p_ward_id: filters?.ward_id
        ? typeof filters.ward_id === "string" && filters.ward_id.includes("-")
          ? filters.ward_id
          : null
        : null, // Handle UUID vs int if needed, but schema uses UUID for IDs usually.
      p_staff_role: filters?.role !== "all" ? filters?.role : null,
      p_is_active:
        filters?.status === "active"
          ? true
          : filters?.status === "inactive"
          ? false
          : null,
    });

    const { data, error } = await query;
    if (error) throw error;

    // Fetch avatar URLs separately or via join if not in RPC
    // For now, we assume basic details are correct.
    // To get workload/performance data for the list view, we might need to join with mv_staff_performance
    // or rely on what rpc_get_all_staff returns.
    // If rpc_get_all_staff doesn't return workload, we might need a secondary fetch or update the RPC.
    // Assuming rpc_get_all_staff returns basic info.

    // ENHANCEMENT: Fetch workload from mv_staff_performance to populate the table columns correctly
    const staffIds = data.map((s: any) => s.user_id);
    const { data: performanceData } = await client
      .from("mv_staff_performance")
      .select("user_id, current_workload, availability_status")
      .in("user_id", staffIds);

    const performanceMap = new Map(
      performanceData?.map((p: any) => [p.user_id, p]) || []
    );

    return data.map((s: any) => ({
      ...s,
      current_workload: performanceMap.get(s.user_id)?.current_workload || 0,
      availability_status:
        performanceMap.get(s.user_id)?.availability_status || "offline",
      // Start: Add missing fields for type compatibility if RPC doesn't return them directly
      department_name: s.department_name,
      ward_number: s.ward_number,
      staff_role: s.staff_role,
      // End
    })) as AdminStaffListItem[];
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
      -- Points to the public.users table
      user:users!staff_profiles_user_id_fkey(email, phone),
      
      -- Points to user_profiles table using the constraint we just created
      profile:user_profiles!user_profiles_staff_link_fkey(
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
};