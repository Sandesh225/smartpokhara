// features/complaints/hooks/useComplaints.ts

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { complaintsApi } from "../api";
import { ComplaintFilters } from "../types";

export const COMPLAINT_KEYS = {
  all: ["complaints"] as const,
  lists: () => [...COMPLAINT_KEYS.all, "list"] as const,
  list: (filters: ComplaintFilters & { page?: number; pageSize?: number }) => 
    [...COMPLAINT_KEYS.lists(), filters] as const,
  details: () => [...COMPLAINT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...COMPLAINT_KEYS.details(), id] as const,
};

export function useComplaints(
  filters: ComplaintFilters,
  page = 1,
  pageSize = 10
) {
  // FIX: Memoize the client
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: COMPLAINT_KEYS.list({ ...filters, page, pageSize }),
    queryFn: () => complaintsApi.searchComplaints(supabase, { ...filters, page, pageSize }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 1, 
  });
}

export function useComplaint(id: string) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: COMPLAINT_KEYS.detail(id),
    queryFn: async () => {
      const [complaint, details] = await Promise.all([
        complaintsApi.getComplaintById(supabase, id),
        complaintsApi.getComplaintDetails(supabase, id)
      ]);
      
      return {
        ...complaint,
        ...details
      };
    },
    enabled: !!id,
  });
}

export function useUserComplaintStats(userId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: [...COMPLAINT_KEYS.all, "citizen-stats", userId],
    queryFn: async () => {
      // Use the database RPC which securely calculates stats using auth.uid() automatically
      const { data, error } = await supabase.rpc("rpc_get_dashboard_stats");
      
      if (error) {
        console.error("Failed to fetch citizen stats:", error);
        return { total: 0, open: 0, in_progress: 0, resolved: 0 };
      }
      
      // The RPC returns { complaints: {...}, bills: {...} }, so we return just the complaints part
      return data.complaints || { total: 0, open: 0, in_progress: 0, resolved: 0 };
    },
    // We only need to know the user is authenticated, the backend handles the ID
    enabled: !!userId, 
    staleTime: 1000 * 60 * 5, 
  });
}