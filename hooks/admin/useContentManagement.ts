"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminContentQueries } from "@/lib/supabase/queries/admin/content";
import { Notice, CMSPage, NoticeInput, PageInput } from "@/types/admin-content";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useContentManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // --- Fetchers ---
  const fetchNotices = useCallback(async () => {
    try {
      const data = await adminContentQueries.getAllNotices(supabase);
      setNotices(data);
    } catch (e) {
      console.error(e);
    }
  }, [supabase]);

  const fetchPages = useCallback(async () => {
    try {
      const data = await adminContentQueries.getAllPages(supabase);
      setPages(data);
    } catch (e) {
      console.error(e);
    }
  }, [supabase]);

  const refreshAll = async () => {
      setLoading(true);
      await Promise.all([fetchNotices(), fetchPages()]);
      setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // --- Notice Mutations ---
  const createNotice = async (input: NoticeInput) => {
    try {
      await adminContentQueries.createNotice(supabase, input);
      toast.success("Notice published successfully");
      router.push("/admin/content/notices");
      fetchNotices();
    } catch (e) {
      console.error(e);
      toast.error("Failed to publish notice");
      throw e;
    }
  };

  const updateNotice = async (id: string, input: Partial<NoticeInput>) => {
    try {
      await adminContentQueries.updateNotice(supabase, id, input);
      toast.success("Notice updated successfully");
      router.push("/admin/content/notices");
      fetchNotices();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update notice");
      throw e;
    }
  };

  const deleteNotice = async (id: string) => {
      if(!confirm("Are you sure? This action cannot be undone.")) return;
      try {
          await adminContentQueries.deleteNotice(supabase, id);
          toast.success("Notice deleted");
          fetchNotices();
      } catch(e) {
          toast.error("Delete failed");
      }
  };

  // --- Page Mutations ---
  const createPage = async (input: PageInput) => {
      try {
          await adminContentQueries.createPage(supabase, input);
          toast.success("Page created successfully");
          router.push("/admin/content/pages");
          fetchPages();
      } catch (e) {
          console.error(e);
          toast.error("Failed to create page");
          throw e;
      }
  };

  const updatePage = async (id: string, input: Partial<PageInput>) => {
    try {
        await adminContentQueries.updatePage(supabase, id, input);
        toast.success("Page updated successfully");
        router.push("/admin/content/pages");
        fetchPages();
    } catch (e) {
        console.error(e);
        toast.error("Failed to update page");
        throw e;
    }
  };

  const deletePage = async (id: string) => {
      if(!confirm("Are you sure? This action cannot be undone.")) return;
      try {
          await adminContentQueries.deletePage(supabase, id);
          toast.success("Page deleted");
          fetchPages();
      } catch(e) {
          toast.error("Failed to delete page");
      }
  };

  return {
    notices,
    pages,
    loading,
    refresh: refreshAll,
    createNotice,
    updateNotice,
    deleteNotice,
    createPage,
    updatePage,
    deletePage
  };
}