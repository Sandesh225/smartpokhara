import { SupabaseClient } from "@supabase/supabase-js";
import { differenceInBusinessDays, parseISO } from "date-fns";

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
      .from("leave_balances") // Matches SQL schema
      .select("*")
      .eq("staff_id", staffId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching balances:", error.message);
    }

    // Default defaults for Pokhara Municipality Staff
    return (
      (data as LeaveBalance) || {
        annual_allowed: 15,
        annual_used: 0,
        sick_allowed: 12,
        sick_used: 0,
        casual_allowed: 6,
        casual_used: 0,
      }
    );
  },

  /**
   * Fetch request history ordered by newest first.
   */
  async getMyRequests(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("leave_requests") // Matches SQL schema
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Submit a new leave request.
   */
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
        type: payload.type, // 'casual', 'sick', etc.
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