"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "../api";
import { CreateStaffInput } from "../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useStaffMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  const createStaff = useMutation({
    mutationFn: async (input: CreateStaffInput) => {
      return staffApi.registerStaff(supabase, input);
    },
    onSuccess: (data) => {
      toast.success("Staff member registered successfully");
      queryClient.invalidateQueries({ queryKey: ["staff", "list"] });
      // If invitation needed, data.requires_invitation check logic here
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create staff");
    },
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return staffApi.updateStaff(supabase, id, updates);
    },
    onSuccess: () => {
      toast.success("Staff member updated");
      queryClient.invalidateQueries({ queryKey: ["staff", "list"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "details"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update staff");
    },
  });

  const approveLeave = useMutation({
    mutationFn: async ({ id, by }: { id: string; by: string }) => {
      return staffApi.updateLeaveStatus(supabase, id, "approved", by);
    },
    onSuccess: () => {
      toast.success("Leave approved");
      queryClient.invalidateQueries({ queryKey: ["staff", "leaves"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to approve leave"),
  });

  const rejectLeave = useMutation({
    mutationFn: async ({ id, by }: { id: string; by: string }) => {
      return staffApi.updateLeaveStatus(supabase, id, "rejected", by);
    },
    onSuccess: () => {
      toast.success("Leave rejected");
      queryClient.invalidateQueries({ queryKey: ["staff", "leaves"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to reject leave"),
  });

  return {
    createStaff,
    updateStaff,
    approveLeave,
    rejectLeave,
  };
}
