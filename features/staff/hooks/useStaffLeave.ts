import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "../api";
import { toast } from "sonner";

export function useStaffLeave(staffId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: balance, isLoading: loadingBalance } = useQuery({
    queryKey: ["staff", "leave", "balance", staffId],
    queryFn: () => staffApi.getLeaveBalance(supabase, staffId),
    enabled: !!staffId,
  });

  const requestLeave = useMutation({
    mutationFn: async (input: { type: string; startDate: string; endDate: string; reason: string }) => {
      return staffApi.requestLeave(supabase, { ...input, staffId });
    },
    onSuccess: () => {
      toast.success("Leave requested successfully");
      queryClient.invalidateQueries({ queryKey: ["staff", "leave"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to request leave");
    },
  });

  return {
    balance,
    loading: loadingBalance,
    requestLeave,
  };
}

export function useActiveLeaveRequests(staffId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["staff", "leave", "active", staffId],
    queryFn: () => staffApi.getActiveRequests(supabase, staffId),
    enabled: !!staffId,
  });
}

export function useLeaveRequestHistory(staffId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["staff", "leave", "history", staffId],
    queryFn: () => staffApi.getRequestHistory(supabase, staffId),
    enabled: !!staffId,
  });
}

export function usePendingLeaves(staffIds: string[]) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["staff", "leave", "pending", staffIds],
        queryFn: () => staffApi.getPendingLeaves(supabase, staffIds),
        enabled: staffIds.length > 0
    });

    const updateStatus = useMutation({
        mutationFn: async ({ leaveId, status, supervisorId }: { leaveId: string, status: "approved" | "rejected", supervisorId: string }) => {
            return staffApi.updateLeaveStatus(supabase, leaveId, status, supervisorId);
        },
        onSuccess: () => {
            toast.success("Leave status updated");
            queryClient.invalidateQueries({ queryKey: ["staff", "leave"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update leave status");
        }
    });

    return {
        ...query,
        updateStatus
    };
}
