"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminContentQueries } from "@/lib/supabase/queries/admin/content";
import { Notice, NoticeInput } from "@/types/admin-content";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useContentManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // --- Fetch ---
  const fetchNotices = useCallback(async () => {
    try {
      const data = await adminContentQueries.getAllNotices(supabase);
      setNotices(data);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load notices");
    }
  }, [supabase]);

  // --- Initial Load ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchNotices();
      setLoading(false);
    };
    init();
  }, [fetchNotices]);

  // --- Create ---
  const createNotice = async (input: NoticeInput) => {
    try {
      await adminContentQueries.createNotice(supabase, input);
      toast.success("Notice published successfully");
      router.push("/admin/content/notices");
      fetchNotices();
    } catch (e: any) {
      toast.error(e.message || "Failed to publish notice");
      throw e;
    }
  };

  // ✅ ADD THIS: Update Logic
  const updateNotice = async (id: string, input: Partial<NoticeInput>) => {
    try {
      await adminContentQueries.updateNotice(supabase, id, input);
      toast.success("Notice updated successfully");
      router.push("/admin/content/notices");
      fetchNotices();
    } catch (e: any) {
      toast.error(e.message || "Failed to update notice");
      throw e;
    }
  };

  // ✅ ADD THIS: Delete Logic
  const deleteNotice = async (id: string) => {
    try {
      await adminContentQueries.deleteNotice(supabase, id);
      toast.success("Notice deleted");
      // Optimistic update: remove from local state immediately
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      toast.error("Failed to delete notice");
    }
  };

  return {
    notices,
    loading,
    createNotice,
    updateNotice, // ✅ Now exported, fixing the error
    deleteNotice, // ✅ Now exported
    refresh: fetchNotices,
  };
}