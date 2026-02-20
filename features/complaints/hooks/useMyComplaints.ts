// features/complaints/hooks/useMyComplaints.ts

"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { complaintsApi } from "../api";
import { ComplaintFilters } from "../types";
import { COMPLAINT_KEYS } from "./useComplaint";

export function useMyComplaints(
  userId: string | undefined,
  filters: ComplaintFilters,
  page = 1,
  pageSize = 10,
  initialData?: any
) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: [...COMPLAINT_KEYS.lists(), "my", userId, filters, page, pageSize],
    queryFn: async () => {
      // Return empty safely if we don't have an ID yet
      if (!userId) return { data: [], total: 0 };
      
      // Let the error bubble up to React Query instead of catching it
      return await complaintsApi.getUserComplaints(supabase, userId, { ...filters, page, pageSize });
    },
    enabled: !!userId,
    initialData: initialData,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}