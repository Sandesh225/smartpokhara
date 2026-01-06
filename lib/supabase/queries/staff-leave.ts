import { SupabaseClient } from "@supabase/supabase-js";

export const staffLeaveQueries = {
  // --- STAFF FUNCTIONS ---

  /**
   * Fetch leave balances for the current user
   * Renamed from getBalances -> getMyBalance to match page.tsx
   */
  async getMyBalance(client: SupabaseClient, staffId: string) {
    const currentYear = new Date().getFullYear();
    
    const { data, error } = await client
      .from("staff_leave_balances")
      .select("*")
      .eq("staff_id", staffId)
      .eq("year", currentYear)
      .maybeSingle(); // Use maybeSingle to avoid 406 error if row missing

    if (error) {
      console.error("Error fetching balances:", error);
      // Return default "zero" state on error so UI doesn't crash
      return { 
        sick_total: 12, sick_used: 0,
        casual_total: 12, casual_used: 0,
        annual_total: 15, annual_used: 0
      };
    }

    // If no record exists yet, return defaults
    if (!data) {
        return { 
            sick_total: 12, sick_used: 0,
            casual_total: 12, casual_used: 0,
            annual_total: 15, annual_used: 0
        };
    }

    return data;
  },

  /**
   * Fetch request history
   * Renamed from getRequestHistory -> getMyRequests
   */
  async getMyRequests(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("staff_leave_requests")
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      return [];
    }
    return data || [];
  },

  /**
   * Submit a new leave request
   * Renamed from createRequest -> requestLeave
   */
  async requestLeave(client: SupabaseClient, payload: {
    staffId: string; // Note: Payload uses camelCase keys in page.tsx
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    totalDays: number;
  }) {
    const { data, error } = await client
      .from("staff_leave_requests")
      .insert({
        staff_id: payload.staffId,
        leave_type: payload.type,
        start_date: payload.startDate,
        end_date: payload.endDate,
        reason: payload.reason,
        total_days: payload.totalDays
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// --- SUPERVISOR FUNCTIONS (Kept as is) ---

export const supervisorLeaveQueries = {
  async getPendingRequests(client: SupabaseClient, supervisorId: string) {
    const { data: supervisor } = await client
      .from("supervisor_profiles")
      .select("assigned_departments, assigned_wards")
      .eq("user_id", supervisorId)
      .single();

    if (!supervisor) return [];

    const { data, error } = await client
      .from("staff_leave_requests")
      .select(`
        *,
        requester:staff_profiles!inner(
          staff_code,
          department_id,
          ward_id,
          user:users(profile:user_profiles(full_name, profile_photo_url))
        )
      `)
      .eq("status", "pending")
      .or(`department_id.in.(${supervisor.assigned_departments || []}),ward_id.in.(${supervisor.assigned_wards || []})`, { foreignTable: "requester" })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching pending leaves:", error);
      return [];
    }

    return data || [];
  },

  async processRequest(client: SupabaseClient, requestId: string, adminId: string, status: 'approved' | 'rejected', reason?: string) {
    const { data: request, error: updateError } = await client
      .from("staff_leave_requests")
      .update({
        status: status,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq("id", requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (status === 'approved') {
      const colMap: Record<string, string> = {
        'sick': 'sick_used',
        'casual': 'casual_used',
        'annual': 'annual_used'
      };
      
      const column = colMap[request.leave_type];
      
      if (column) {
        await client.rpc('increment_leave_balance', {
          p_staff_id: request.staff_id,
          p_column: column,
          p_days: request.total_days
        });
      }
    }

    return request;
  }
};