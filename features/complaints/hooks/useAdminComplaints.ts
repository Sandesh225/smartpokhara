"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { complaintsApi } from "../api";
import { ComplaintFilters } from "../types";
import { COMPLAINT_KEYS } from "./useComplaints";

export function useAdminComplaints(filters: ComplaintFilters & { page?: number; pageSize?: number }) {
  const supabase = createClient();

  return useQuery({
    queryKey: COMPLAINT_KEYS.list(filters),
    queryFn: () => complaintsApi.searchComplaints(supabase, filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminComplaintStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["complaint-stats-dashboard"],
    queryFn: () => complaintsApi.getDashboardStats(supabase),
  });
}

