import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { userApi } from "../api";

export function useCitizens(search?: string, page = 1) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin-citizens", search, page],
    queryFn: () => userApi.getCitizens(supabase, search, page),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCitizenDetails(userId: string) {
  const supabase = createClient();

  const profile = useQuery({
    queryKey: ["admin-citizen-details", userId],
    queryFn: () => userApi.getCitizenDetails(supabase, userId),
    enabled: !!userId,
  });

  const complaints = useQuery({
    queryKey: ["admin-citizen-complaints", userId],
    queryFn: () => userApi.getCitizenComplaints(supabase, userId),
    enabled: !!userId,
  });

  const payments = useQuery({
    queryKey: ["admin-citizen-payments", userId],
    queryFn: () => userApi.getCitizenPayments(supabase, userId),
    enabled: !!userId,
  });

  return {
    profile: profile.data,
    complaints: complaints.data,
    payments: payments.data,
    isLoading: profile.isLoading || complaints.isLoading || payments.isLoading,
    error: profile.error || complaints.error || payments.error
  };
}
