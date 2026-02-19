"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { noticesApi } from "../api";
import { NoticeFilters, ProjectNotice, CMSPage, CMSPageInput } from "../types";

export const NOTICE_KEYS = {
  all: ["notices"] as const,
  lists: () => [...NOTICE_KEYS.all, "list"] as const,
  list: (filters: NoticeFilters) => [...NOTICE_KEYS.lists(), filters] as const,
  details: () => [...NOTICE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...NOTICE_KEYS.details(), id] as const,
  unread: (userId: string) => [...NOTICE_KEYS.all, "unread", userId] as const,
  pages: ["cms_pages"] as const,
  page: (slug: string) => ["cms_pages", slug] as const,
};

export function useNotices(filters: NoticeFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTICE_KEYS.list(filters),
    queryFn: () => noticesApi.getNotices(supabase, filters),
  });
}

export function useNotice(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTICE_KEYS.detail(id),
    queryFn: () => noticesApi.getNoticeById(supabase, id),
    enabled: !!id,
  });
}

export function useUnreadNoticesCount(userId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTICE_KEYS.unread(userId || ""),
    queryFn: () => (userId ? noticesApi.getUnreadCount(supabase, userId) : 0),
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useNoticeMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createNotice = useMutation({
    mutationFn: (input: Partial<ProjectNotice> & { is_public?: boolean }) => 
      noticesApi.createNotice(supabase, input),
    onSuccess: () => {
      toast.success("Notice created successfully");
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to create notice"),
  });

  const updateNotice = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProjectNotice> & { is_public?: boolean } }) =>
      noticesApi.updateNotice(supabase, id, updates),
    onSuccess: () => {
      toast.success("Notice updated successfully");
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to update notice"),
  });

  const deleteNotice = useMutation({
    mutationFn: (id: string) => noticesApi.deleteNotice(supabase, id),
    onSuccess: () => {
      toast.success("Notice deleted successfully");
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete notice"),
  });

  const markAsRead = useMutation({
    mutationFn: ({ noticeId, userId }: { noticeId: string; userId: string }) =>
      noticesApi.markAsRead(supabase, noticeId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.unread(userId) });
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.lists() });
    },
  });

  return {
    createNotice,
    updateNotice,
    deleteNotice,
    markAsRead,
  };
}

export function usePages() {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTICE_KEYS.pages,
    queryFn: () => noticesApi.getPages(supabase),
  });
}

export function usePage(slug: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: NOTICE_KEYS.page(slug),
    queryFn: () => noticesApi.getPageBySlug(supabase, slug),
    enabled: !!slug,
  });
}

export function usePageMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createPage = useMutation({
    mutationFn: (input: CMSPageInput) => noticesApi.createPage(supabase, input),
    onSuccess: () => {
      toast.success("Page created successfully");
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.pages });
    },
    onError: (error: any) => toast.error(error.message || "Failed to create page"),
  });

  const updatePage = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CMSPageInput> }) =>
      noticesApi.updatePage(supabase, id, updates),
    onSuccess: () => {
      toast.success("Page updated successfully");
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.pages });
    },
    onError: (error: any) => toast.error(error.message || "Failed to update page"),
  });

  const deletePage = useMutation({
    mutationFn: (id: string) => noticesApi.deletePage(supabase, id),
    onSuccess: () => {
      toast.success("Page deleted successfully");
      queryClient.invalidateQueries({ queryKey: NOTICE_KEYS.pages });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete page"),
  });

  return {
    createPage,
    updatePage,
    deletePage,
  };
}
