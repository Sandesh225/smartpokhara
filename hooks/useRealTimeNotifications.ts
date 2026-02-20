"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useRealTimeNotifications(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter(); // Use router for navigation
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchUnread = async () => {
      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false);
        
        if (!error && count !== null) setUnreadCount(count);
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    };

    fetchUnread();

    // Subscribe to realtime
    const channel = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1);
          const newNotif = payload.new as any;
          
          toast(newNotif.title || "New Notification", {
            description: newNotif.message,
            action: {
              label: "View",
              onClick: () => router.push(newNotif.link || "/notifications"),
            },
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, router]);

  return { unreadCount, isConnected };
}
