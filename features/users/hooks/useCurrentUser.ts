// features/users/hooks/useCurrentUser.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { userApi } from "../api";

export function useCurrentUser() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const profile = await userApi.getProfile(supabase, user.id);
      
      return { 
        ...profile,  // Profile data
        ...user,     // Auth data (spread second to ensure email/id come from Auth)
        id: user.id, // FORCED: Ensure 'id' is always the Supabase Auth UID
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}