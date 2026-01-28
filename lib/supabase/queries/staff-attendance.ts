import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Staff Attendance Queries
 * Maps directly to the 'attendance_logs' table and associated RPC functions.
 */
export const staffAttendanceQueries = {
  /**
   * 1. GET TODAY'S STATUS
   * Used to determine UI state (Show 'Check In' vs 'Check Out' button).
   */
  async getTodayStatus(client: SupabaseClient, staffId: string) {
    // Get date string in YYYY-MM-DD format based on local time needs
    // Note: The DB defaults date to CURRENT_DATE, so we match that string
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await client
      .from("attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .eq("date", today)
      .maybeSingle();

    if (error) {
      console.error("Error fetching today's status:", error.message);
      return null;
    }

    return data;
  },

  /**
   * 2. CHECK IN (RPC)
   * Calls the PostgreSQL function `rpc_staff_check_in`.
   * Requires Latitude and Longitude for PostGIS geofencing verification.
   */
  async checkIn(
    client: SupabaseClient,
    lat: number,
    lng: number,
    deviceId: string = "browser"
  ) {
    // The SQL function signature is: rpc_staff_check_in(p_lat, p_lng, p_device_id)
    const { data, error } = await client.rpc("rpc_staff_check_in", {
      p_lat: lat,
      p_lng: lng,
      p_device_id: deviceId,
    });

    if (error) {
      console.error("Check-in RPC Error:", error.message);
      throw new Error(error.message || "Failed to check in.");
    }

    return data;
  },

  /**
   * 3. CHECK OUT (RPC)
   * Calls the PostgreSQL function `rpc_staff_check_out`.
   * Automatically calculates total_hours in the backend.
   */
  async checkOut(client: SupabaseClient, lat: number, lng: number) {
    // The SQL function signature is: rpc_staff_check_out(p_lat, p_lng)
    const { data, error } = await client.rpc("rpc_staff_check_out", {
      p_lat: lat,
      p_lng: lng,
    });

    if (error) {
      console.error("Check-out RPC Error:", error.message);
      throw new Error(error.message || "Failed to check out.");
    }

    return data;
  },

  /**
   * 4. GET HISTORY
   * Fetches recent logs for the History List component.
   */
  async getAttendanceHistory(
    client: SupabaseClient,
    staffId: string,
    limit: number = 15
  ) {
    const { data, error } = await client
      .from("attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching attendance history:", error.message);
      return [];
    }

    return data || [];
  },

  /**
   * 5. GET MONTHLY STATISTICS
   * Aggregates data for the Dashboard Header cards (Days Worked, Total Hours, Lateness).
   */
  async getAttendanceStats(client: SupabaseClient, staffId: string) {
    const now = new Date();
    // Calculate first day of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const { data, error } = await client
      .from("attendance_logs")
      .select("total_hours, status")
      .eq("staff_id", staffId)
      .gte("date", startOfMonth);

    if (error) {
      console.error("Error calculating stats:", error.message);
      // Return safe defaults to prevent UI crash
      return {
        daysWorked: 0,
        totalHours: 0,
        lateDays: 0,
        presentDays: 0,
      };
    }

    // Client-side aggregation of the raw log data
    const stats = {
      daysWorked: data.length,
      totalHours: data.reduce(
        (acc, log) => acc + (Number(log.total_hours) || 0),
        0
      ),
      lateDays: data.filter((log) => log.status === "late").length,
      presentDays: data.filter((log) => log.status === "present").length,
    };

    return stats;
  },
};