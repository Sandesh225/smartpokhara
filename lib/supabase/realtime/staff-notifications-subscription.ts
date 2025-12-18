import { createClient } from "@/lib/supabase/client";

export const staffNotificationsSubscription = {
  subscribeToStaffNotifications(userId: string, onNewNotification: (n: any) => void) {
    const supabase = createClient();
    return supabase
      .channel(`staff-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onNewNotification(payload.new)
      )
      .subscribe();
  },

  unsubscribe(channel: any) {
    const supabase = createClient();
    supabase.removeChannel(channel);
  }
};