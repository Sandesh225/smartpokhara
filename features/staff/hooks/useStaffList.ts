import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "../api";
import { StaffFiltersState } from "../types";

export function useStaffList(filters?: StaffFiltersState) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["staff", "list", filters],
    queryFn: async () => {
      const sanitizedFilters = filters ? {
        role: filters.role === 'all' ? undefined : filters.role,
        department_id: filters.department_id || undefined,
        ward_id: filters.ward_id || undefined,
        search: filters.search || undefined
      } : undefined;
      return staffApi.getAllStaff(supabase, sanitizedFilters);
    },
  });
}

export function useSupervisedStaff(supervisorId: string) {
    const supabase = createClient();
  
    return useQuery({
      queryKey: ["staff", "supervised", supervisorId],
      queryFn: async () => {
        if (!supervisorId) return [];
        return staffApi.getSupervisedStaff(supabase, supervisorId);
      },
      enabled: !!supervisorId
    });
  }
