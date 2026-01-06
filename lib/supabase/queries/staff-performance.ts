import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateSLACompliance, calculateResolutionTime } from "@/lib/utils/performance-helpers";

export const staffPerformanceQueries = {
  /**
   * Fetches summary stats specifically for "Today"
   */
  async getCompletionStats(client: SupabaseClient, staffId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await client
      .from("staff_work_assignments")
      .select("id")
      .eq("staff_id", staffId)
      .eq("assignment_status", "completed")
      .gte("completed_at", today.toISOString());

    if (error) {
      console.error("Error fetching completion stats:", error);
      return { completed_today: 0 };
    }

    return {
      completed_today: data?.length || 0,
    };
  },

  async getMyPerformance(client: SupabaseClient, staffId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Fetch Resolved Work
    const { data: resolved, error: resolvedError } = await client
      .from("staff_work_assignments")
      .select("id, created_at, completed_at, due_at, assignment_status")
      .eq("staff_id", staffId)
      .eq("assignment_status", "completed")
      .gte("completed_at", startDate.toISOString());

    if (resolvedError) {
      console.error("Assignments Error:", resolvedError);
    }

    // 2. Fetch Feedback (Citizen Ratings)
    const { data: feedback, error: feedbackError } = await client
      .from("complaint_feedback")
      .select(
        `
        rating,
        complaint:complaints!inner(assigned_staff_id)
      `
      )
      .eq("complaint.assigned_staff_id", staffId)
      .gte("created_at", startDate.toISOString());

    if (feedbackError) {
      console.error("Feedback Error:", feedbackError);
    }

    // Process Metrics
    const totalCompleted = resolved?.length || 0;
    const onTime =
      resolved?.filter((t) => {
        if (!t.completed_at || !t.due_at) return false;
        return new Date(t.completed_at) <= new Date(t.due_at);
      }).length || 0;

    const slaCompliance = calculateSLACompliance(totalCompleted, onTime);

    const completionTimes =
      resolved?.map((t) => ({
        submitted_at: t.created_at,
        resolved_at: t.completed_at!,
      })) || [];

    const avgResolutionTime = calculateResolutionTime(completionTimes);

    const ratings = feedback?.map((f: any) => f.rating) || [];
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 5.0;

    return {
      totalCompleted,
      slaCompliance,
      avgResolutionTime,
      avgRating,
      recentWork: resolved?.slice(0, 5) || [],
    };
  },

  async getAchievements(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("staff_achievements")
      .select("*")
      .eq("staff_id", staffId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Achievements Error:", error);
      return [];
    }

    return data || [];
  },
};