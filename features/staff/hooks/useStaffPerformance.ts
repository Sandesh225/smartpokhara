import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "../api";

export function useStaffPerformance(staffId: string) {
  const supabase = createClient();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["staff", "performance", "stats", staffId],
    queryFn: () => staffApi.getPerformanceStats(supabase, staffId),
    enabled: !!staffId,
  });

  const { data: myPerformance, isLoading: loadingMyPerformance } = useQuery({
      queryKey: ["staff", "performance", "my", staffId],
      queryFn: () => staffApi.getMyPerformance(supabase, staffId),
      enabled: !!staffId
  });

  return {
    stats,
    myPerformance,
    loading: loadingStats || loadingMyPerformance,
  };
}

export function useDashboardWidgets(userId: string) {
    const supabase = createClient();

    const { data: achievements } = useQuery({
        queryKey: ["staff", "achievements", userId],
        queryFn: () => staffApi.getAchievements(supabase, userId),
        enabled: !!userId
    });

    const { data: completionStats } = useQuery({
        queryKey: ["staff", "completion", userId],
        queryFn: () => staffApi.getCompletionStats(supabase, userId),
        enabled: !!userId
    });

    const { data: upcomingShifts } = useQuery({
        queryKey: ["staff", "shifts", userId],
        queryFn: () => staffApi.getUpcomingShifts(supabase, userId),
        enabled: !!userId
    });

    const { data: upcomingTasks } = useQuery({
        queryKey: ["staff", "upcomingTasks", userId],
        queryFn: () => staffApi.getUpcomingTasks(supabase, userId),
        enabled: !!userId
    });

    return {
        achievements,
        completionStats,
        upcomingShifts,
        upcomingTasks
    };
}

export function useWorkloadStats(supervisorId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["staff", "workload", supervisorId],
    queryFn: async () => {
      if (!supervisorId) return null;
      return staffApi.getWorkloadStats(supabase, supervisorId);
    },
    enabled: !!supervisorId,
  });
}
