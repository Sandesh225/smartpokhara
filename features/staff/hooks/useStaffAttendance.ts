import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "../api";
import { toast } from "sonner";

export function useStaffAttendance(staffId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: todayStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ["staff", "attendance", "today", staffId],
    queryFn: () => staffApi.getTodayStatus(supabase, staffId),
    enabled: !!staffId,
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["staff", "attendance", "history", staffId],
    queryFn: () => staffApi.getAttendanceHistory(supabase, staffId),
    enabled: !!staffId,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["staff", "attendance", "stats", staffId],
    queryFn: () => staffApi.getAttendanceStats(supabase, staffId),
    enabled: !!staffId,
  });

  const checkIn = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      return staffApi.checkIn(supabase, lat, lng);
    },
    onSuccess: () => {
      toast.success("Checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["staff", "attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to check in");
    },
  });

  const checkOut = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      return staffApi.checkOut(supabase, lat, lng);
    },
    onSuccess: () => {
      toast.success("Checked out successfully");
      queryClient.invalidateQueries({ queryKey: ["staff", "attendance"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to check out");
    },
  });

  return {
    todayStatus,
    history,
    stats,
    loading: loadingStatus || loadingHistory || loadingStats,
    checkIn,
    checkOut,
  };
}

export function useStaffAttendanceOverview(supervisorId: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["staff", "attendance", "overview", supervisorId],
        queryFn: () => staffApi.getStaffAttendanceOverview(supabase, supervisorId),
        enabled: !!supervisorId
    });
}
