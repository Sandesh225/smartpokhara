"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { adminDashboardApi } from "../api";

export const DASHBOARD_KEYS = {
  all: ["dashboard"] as const,
  metrics: () => [...DASHBOARD_KEYS.all, "metrics"] as const,
  activity: () => [...DASHBOARD_KEYS.all, "activity"] as const,
  tasks: () => [...DASHBOARD_KEYS.all, "tasks"] as const,
  trends: () => [...DASHBOARD_KEYS.all, "trends"] as const,
  citizenStats: (userId: string) => [...DASHBOARD_KEYS.all, "citizen", userId] as const,
};

export function useAdminMetrics() {
  const supabase = createClient();

  return useQuery({
    queryKey: DASHBOARD_KEYS.metrics(),
    queryFn: () => adminDashboardApi.getAdminMetrics(supabase),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentActivity(limit = 5) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...DASHBOARD_KEYS.activity(), limit],
    queryFn: () => adminDashboardApi.getRecentActivity(supabase, limit),
  });
}

export function useRecentDashboardTasks(limit = 5) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...DASHBOARD_KEYS.tasks(), limit],
    queryFn: () => adminDashboardApi.getRecentTasks(supabase, limit),
  });
}

export function useComplaintTrends() {
  const supabase = createClient();

  return useQuery({
    queryKey: DASHBOARD_KEYS.trends(),
    queryFn: () => adminDashboardApi.getComplaintTrends(supabase),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCitizenDashboardStats(userId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: DASHBOARD_KEYS.citizenStats(userId || ""),
    queryFn: () => adminDashboardApi.getCitizenDashboardStats(supabase),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
