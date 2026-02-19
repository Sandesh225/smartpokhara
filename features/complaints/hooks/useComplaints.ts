"use client";

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
  const supabase = createClient();

  return useQuery({
    queryKey: COMPLAINT_KEYS.list({ ...filters, page, pageSize }),
    queryFn: () => complaintsApi.searchComplaints(supabase, { ...filters, page, pageSize }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    staleTime: 1000 * 60 * 1, // 1 minute stale time
  });
}


