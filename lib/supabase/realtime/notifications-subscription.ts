// lib/supabase/realtime/notifications-subscriptons.ts
import { supabase } from "@/lib/supabase/client";

export const supervisorNotificationsSubscription = {
  /**
   * Listens for NEW notifications for a specific supervisor.
   * Feeds the Notification Bell and RealTimeAlerts panel.
   */
  subscribeToSupervisorNotifications(
    supervisorId: string,
    onInsert: (notification: any) => void
  ) {
    const channel = supabase
      .channel(`supervisor-notifications:${supervisorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supervisor_notifications",
          filter: `supervisor_id=eq.${supervisorId}`,
        },
        (payload) => {
          onInsert(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Optional: Listen for updates (e.g. read status changes from other devices)
   */
  subscribeToNotificationUpdates(
    supervisorId: string,
    onUpdate: (notification: any) => void
  ) {
    const channel = supabase
      .channel(`supervisor-notification-updates:${supervisorId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "supervisor_notifications",
          filter: `supervisor_id=eq.${supervisorId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
};