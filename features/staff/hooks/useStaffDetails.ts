import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "../api";

export function useStaffDetails(staffId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["staff", "details", staffId],
    queryFn: async () => {
      if (!staffId) return null;
      return staffApi.getStaffDetails(supabase, staffId);
    },
    enabled: !!staffId,
  });
}

export function useStaffAssignments(staffId: string) {
    const supabase = createClient();
  
    return useQuery({
      queryKey: ["staff", "assignments", staffId],
      queryFn: async () => {
        if (!staffId) return { complaints: [], tasks: [] };
        return staffApi.getStaffAssignments(supabase, staffId);
      },
      enabled: !!staffId,
    });
  }
