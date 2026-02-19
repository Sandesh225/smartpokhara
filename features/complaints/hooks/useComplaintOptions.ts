"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { complaintsApi } from "../api";

export function useCategories() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["complaint-categories"],
    queryFn: () => complaintsApi.getCategories(supabase),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useWards() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["wards"],
    queryFn: () => complaintsApi.getWards(supabase),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
export function useSubcategories(categoryId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["complaint-subcategories", categoryId],
    queryFn: () => complaintsApi.getSubcategories(supabase, categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
