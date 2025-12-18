import type { SupabaseClient } from "@supabase/supabase-js";

export const staffScheduleQueries = {
  async getMySchedule(client: SupabaseClient, staffId: string) {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await client
      .from("staff_daily_schedules")
      .select("*")
      .eq("staff_id", staffId)
      .gte("schedule_date", today)
      .order("schedule_date", { ascending: true })
      .limit(7);

    if (error) {
      console.warn("Schedule fetch failed (table might be empty/missing):", error.message);
      return [];
    }
    return data || [];
  },

  async getUpcomingTasks(client: SupabaseClient, staffId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString();

    const { data, error } = await client
      .from("staff_work_assignments")
      .select("id, due_at, priority")
      .eq("staff_id", staffId)
      .gte("due_at", tomorrowStr)
      .order("due_at", { ascending: true })
      .limit(5);

    if (error) throw error;
    return data || [];
  }
};