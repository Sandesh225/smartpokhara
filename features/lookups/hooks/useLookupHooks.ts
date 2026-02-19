"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { lookupApi } from "../api";

export const LOOKUP_KEYS = {
  all: ["lookups"] as const,
  categories: () => [...LOOKUP_KEYS.all, "categories"] as const,
  subcategories: (categoryId: string) => [...LOOKUP_KEYS.all, "subcategories", categoryId] as const,
  wards: () => [...LOOKUP_KEYS.all, "wards"] as const,
  departments: () => [...LOOKUP_KEYS.all, "departments"] as const,
  sla: () => [...LOOKUP_KEYS.all, "sla"] as const,
  settings: () => [...LOOKUP_KEYS.all, "settings"] as const,
};

export function useCategories() {
  const supabase = createClient();
  return useQuery({
    queryKey: LOOKUP_KEYS.categories(),
    queryFn: () => lookupApi.getCategories(supabase),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useSubcategories(categoryId?: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: LOOKUP_KEYS.subcategories(categoryId || ""),
    queryFn: () => (categoryId ? lookupApi.getSubcategories(supabase, categoryId) : []),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 60,
  });
}

export function useWards() {
  const supabase = createClient();
  return useQuery({
    queryKey: LOOKUP_KEYS.wards(),
    queryFn: () => lookupApi.getWards(supabase),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useDepartments() {
  const supabase = createClient();
  return useQuery({
    queryKey: LOOKUP_KEYS.departments(),
    queryFn: () => lookupApi.getDepartments(supabase),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useSystemSettings() {
  const supabase = createClient();
  return useQuery({
    queryKey: LOOKUP_KEYS.settings(),
    queryFn: () => lookupApi.getSystemSettings(supabase),
    staleTime: 1000 * 60 * 60,
  });
}
