"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminContentQueries } from "@/lib/supabase/queries/admin/content";
import { Notice, CMSPage, NoticeInput, PageInput } from "@/types/admin-content";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useContentManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchNotices = useCallback(async () => {
    try {
      const data = await adminContentQueries.getAllNotices(supabase);
      setNotices(data);
    } catch (e: any) {
      toast.error("Failed to load notices");
    }
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchNotices();
      setLoading(false);
    };
    init();
  }, [fetchNotices]);

  const createNotice = async (input: NoticeInput) => {
    try {
      await adminContentQueries.createNotice(supabase, input);
      toast.success("Notice published successfully");
      router.push("/admin/content/notices"); // Redirect to list
      fetchNotices(); // Refresh list in background
    } catch (e: any) {
      toast.error(e.message || "Failed to publish notice");
      throw e;
    }
  };

  return {
    notices,
    loading,
    createNotice,
    refresh: fetchNotices,
  };
}