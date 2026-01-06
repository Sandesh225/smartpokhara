import type { SupabaseClient } from "@supabase/supabase-js";

export const staffAttendanceQueries = {
  /**
   * Get the current status.
   * Logic: If the latest log has no check_out_time, you are ON DUTY.
   */
  async getTodayStatus(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("staff_attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching attendance:", error.message);
      return null;
    }

    if (!data) return null;

    // 1. Active Shift (No checkout yet) -> ON DUTY
    if (!data.check_out_time) {
      return data;
    }

    // 2. Completed Shift (Checkout exists)
    // Only show as "Off Duty" if it happened TODAY. Otherwise, reset to "Not Checked In".
    const logDate = new Date(data.created_at).toDateString();
    const today = new Date().toDateString();

    if (logDate === today) {
      return data; // Completed shift from today
    }

    return null; // Old history, ready for new day
  },

  async checkIn(
    client: SupabaseClient,
    location?: { lat: number; lng: number }
  ) {
    const locationJson = location
      ? { type: "Point", coordinates: [location.lng, location.lat] }
      : null;

    const { data, error } = await client.rpc("rpc_staff_check_in", {
      p_location: locationJson,
    });

    if (error) throw new Error(error.message);

    // Handle Logic Codes
    if (!data.success) {
      if (data.code === "ALREADY_COMPLETED")
        throw new Error("ALREADY_COMPLETED");
      if (data.code === "ALREADY_ON_DUTY") throw new Error("ALREADY_ON_DUTY");
      throw new Error(data.message || "Check-in failed");
    }

    return data;
  },

  async checkOut(
    client: SupabaseClient,
    location?: { lat: number; lng: number }
  ) {
    const locationJson = location
      ? { type: "Point", coordinates: [location.lng, location.lat] }
      : null;

    const { data, error } = await client.rpc("rpc_staff_check_out", {
      p_location: locationJson,
    });

    if (error) throw new Error(error.message);
    if (!data.success) throw new Error(data.message || "Check-out failed");
    return data;
  },

  async getAttendanceHistory(
    client: SupabaseClient,
    staffId: string,
    limit = 15
  ) {
    const { data } = await client
      .from("staff_attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
  },

  async getAttendanceStats(client: SupabaseClient, staffId: string) {
    const today = new Date();
    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    ).toISOString();

    const { data } = await client
      .from("staff_attendance_logs")
      .select("total_hours_worked")
      .eq("staff_id", staffId)
      .gte("created_at", startOfMonth);

    const daysWorked = data?.length || 0;
    const totalHours =
      data?.reduce(
        (acc, log) => acc + (Number(log.total_hours_worked) || 0),
        0
      ) || 0;

    return { daysWorked, totalHours };
  },
};