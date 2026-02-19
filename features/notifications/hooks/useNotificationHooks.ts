"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { notificationsApi } from "../api";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  lists: () => [...NOTIFICATION_KEYS.all, "list"] as const,
  list: (userId: string) => [...NOTIFICATION_KEYS.lists(), userId] as const,
  unread: (userId: string) => [...NOTIFICATION_KEYS.all, "unread", userId] as const,
};

export function useNotifications(userId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(userId || ""),
    queryFn: () => (userId ? notificationsApi.getUserNotifications(supabase, userId) : []),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUnreadNotificationsCount(userId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTIFICATION_KEYS.unread(userId || ""),
    queryFn: () => (userId ? notificationsApi.getUnreadCount(supabase, userId) : 0),
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useNotificationMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to mark as read"),
  });

  const markAllAsRead = useMutation({
    mutationFn: (userId: string) => notificationsApi.markAllAsRead(supabase, userId),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to mark all as read"),
  });

  return {
    markAsRead,
    markAllAsRead,
  };
}
