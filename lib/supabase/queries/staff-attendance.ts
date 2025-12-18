import type { SupabaseClient } from "@supabase/supabase-js";

export const staffAttendanceQueries = {
  /**
   * Get today's attendance record
   */
  async getTodayStatus(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await client
      .from("staff_attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .eq("date", today)
      .maybeSingle();
      
    if (error) console.error("Error fetching today's attendance:", error);
    return data;
  },

  /**
   * Check In (RPC call to handle logic + location)
   */
  async checkIn(client: SupabaseClient, location?: { lat: number; lng: number }) {
    const locationJson = location 
      ? { type: "Point", coordinates: [location.lng, location.lat] } 
      : null;

    const { data, error } = await client.rpc("rpc_staff_check_in", {
      p_location: locationJson
    });

    if (error) throw error;
    return data;
  },

  /**
   * Check Out (RPC call)
   */
  async checkOut(client: SupabaseClient, location?: { lat: number; lng: number }) {
    const locationJson = location 
      ? { type: "Point", coordinates: [location.lng, location.lat] } 
      : null;

    const { data, error } = await client.rpc("rpc_staff_check_out", {
      p_location: locationJson
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get Attendance History
   */
  async getAttendanceHistory(client: SupabaseClient, staffId: string, limit = 30) {
    const { data, error } = await client
      .from("staff_attendance_logs")
      .select("*")
      .eq("staff_id", staffId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get Attendance Stats (Monthly)
   */
  async getAttendanceStats(client: SupabaseClient, staffId: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    
    const { data, error } = await client
      .from("staff_attendance_logs")
      .select("total_hours_worked, check_in_time")
      .eq("staff_id", staffId)
      .gte("date", startOfMonth);

    if (error) return { daysWorked: 0, totalHours: 0 };

    const daysWorked = data.length;
    const totalHours = data.reduce((acc, log) => acc + (log.total_hours_worked || 0), 0);

    return { daysWorked, totalHours };
  }
};