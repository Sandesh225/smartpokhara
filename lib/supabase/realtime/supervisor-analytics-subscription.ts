import { supabase } from "@/lib/supabase/client";

export const supervisorAnalyticsSubscription = {
  /**
   * Listens for any changes that affect analytics charts.
   * - New complaints
   * - Status updates
   * - Feedback submission
   */
  subscribeToAnalyticsUpdates(onUpdate: () => void) {
    const channel = supabase
      .channel("analytics-global-updates")
      // 1. Complaint Changes (Volume, Status, SLA)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => onUpdate()
      )
      // 2. Feedback (Satisfaction)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "complaint_feedback" },
        () => onUpdate()
      )
      // 3. Task Completions (Staff Perf)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "supervisor_tasks" },
        () => onUpdate()
      )
      .subscribe();

    return channel;
  },

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
};