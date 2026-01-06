import { createClient } from "@/lib/supabase/client";

export const noticesService = {
  // 1. Get List of Notices (Fix: Allows Public + My Ward)
  async getUserNotices({
    limit = 10,
    offset = 0,
    search,
    wardId, // This comes from the filter dropdown
    noticeType,
    dateFrom,
    dateTo,
    unreadOnly = false,
  }: {
    limit?: number;
    offset?: number;
    search?: string;
    wardId?: string;
    noticeType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    unreadOnly?: boolean;
  }) {
    const supabase = createClient();

    // Start Query
    let query = supabase
      .from("notices")
      .select("*", { count: "exact" })
      // Ensure we only see published items (published_at <= NOW)
      .lte("published_at", new Date().toISOString())
      // Ensure we don't see expired items (expires_at is NULL OR > NOW)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    // 2. Apply Filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // THE FIX: Only filter by Ward if the user explicitly selected a specific ward in the dropdown.
    // If wardId is empty/undefined/all, we DO NOT filter. This lets the Database RLS policy
    // automatically show you Public notices AND your own ward's notices.
    if (wardId && wardId !== "all") {
      query = query.eq("ward_id", wardId);
    }

    if (noticeType && noticeType !== "all") {
      query = query.eq("notice_type", noticeType);
    }

    if (dateFrom) {
      query = query.gte("published_at", dateFrom.toISOString());
    }

    if (dateTo) {
      // Set to end of day to include notices from that day
      const nextDay = new Date(dateTo);
      nextDay.setHours(23, 59, 59, 999);
      query = query.lte("published_at", nextDay.toISOString());
    }

    // Execute Query
    const {
      data: notices,
      count,
      error,
    } = await query
      .order("is_urgent", { ascending: false }) // Urgent first
      .order("published_at", { ascending: false }) // Newest first
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching notices:", error);
      return { notices: [], total: 0 };
    }

    // 3. Handle "Read/Unread" Status
    // Fetch read receipts for these specific notices
    const noticeIds = notices?.map((n) => n.id) || [];
    let readIds = new Set();

    if (noticeIds.length > 0) {
      const { data: readData } = await supabase
        .from("user_notice_reads")
        .select("notice_id")
        .in("notice_id", noticeIds);

      if (readData) {
        readIds = new Set(readData.map((r) => r.notice_id));
      }
    }

    // Map status to notices
    let processedNotices =
      notices?.map((n) => ({
        ...n,
        is_read: readIds.has(n.id),
      })) || [];

    // Filter in-memory if "Unread Only" is requested (simplest approach for mixed data)
    if (unreadOnly) {
      processedNotices = processedNotices.filter((n) => !n.is_read);
    }

    return {
      notices: processedNotices,
      total: unreadOnly ? processedNotices.length : count || 0,
    };
  },

  // 2. Get Single Notice Details
  async getNoticeById(id: string) {
    const supabase = createClient();

    const { data: notice, error } = await supabase
      .from("notices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const { data: attachments } = await supabase
      .from("notice_attachments")
      .select("*")
      .eq("notice_id", id);

    // Check read status
    const { data: readData } = await supabase
      .from("user_notice_reads")
      .select("id")
      .eq("notice_id", id)
      .single();

    return {
      notice,
      attachments: attachments || [],
      isRead: !!readData,
    };
  },

  // 3. Mark as Read
  async markNoticeAsRead(noticeId: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("user_notice_reads")
      .upsert(
        { user_id: user.id, notice_id: noticeId },
        { onConflict: "user_id,notice_id" }
      );
  },

  // 4. Get Unread Count Badge
  async getUnreadNoticeCount() {
    const supabase = createClient();

    // Total visible notices (handled by RLS)
    const { count: totalCount, error: countError } = await supabase
      .from("notices")
      .select("id", { count: "exact", head: true })
      .lte("published_at", new Date().toISOString())
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (countError) return 0;

    // Total read notices
    const { count: readCount, error: readError } = await supabase
      .from("user_notice_reads")
      .select("id", { count: "exact", head: true });

    if (readError) return 0;

    return Math.max(0, (totalCount || 0) - (readCount || 0));
  },
};
