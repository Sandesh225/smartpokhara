import { SupabaseClient } from "@supabase/supabase-js";

export type LeaveBalance = {
  annual_allowed: number;
  annual_used: number;
  sick_allowed: number;
  sick_used: number;
  casual_allowed: number;
  casual_used: number;
};

export const staffLeaveQueries = {
  /**
   * Fetch leave balances for the current user.
   * If no balance record exists (new staff), returns default values.
   */
  async getMyBalance(
    client: SupabaseClient,
    staffId: string
  ): Promise<LeaveBalance> {
    const { data, error } = await client
      .from("leave_balances")
      .select("*")
      .eq("staff_id", staffId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching balances:", error.message);
    }

    // Default values if database row is missing (must match SQL defaults)
    if (!data) {
      return {
        annual_allowed: 15,
        annual_used: 0,
        sick_allowed: 12,
        sick_used: 0,
        casual_allowed: 6,
        casual_used: 0,
      };
    }

    return data;
  },
  /**
   * Fetch pending requests only (Active)
   */
  async getActiveRequests(client: SupabaseClient, staffId: string) {
    const { data } = await client
      .from("leave_requests")
      .select("*")
      .eq("staff_id", staffId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getRequestHistory(client: SupabaseClient, staffId: string) {
    const { data } = await client
      .from("leave_requests")
      .select("*")
      .eq("staff_id", staffId)
      .in("status", ["approved", "rejected"])
      .order("updated_at", { ascending: false });
    return data || [];
  },

  async requestLeave(
    client: SupabaseClient,
    payload: {
      staffId: string;
      type: string;
      startDate: string;
      endDate: string;
      reason: string;
    }
  ) {
    const { data, error } = await client
      .from("leave_requests")
      .insert({
        staff_id: payload.staffId,
        type: payload.type,
        start_date: payload.startDate,
        end_date: payload.endDate,
        reason: payload.reason,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
