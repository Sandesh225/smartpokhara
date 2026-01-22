import { createClient } from "@/lib/supabase/client";

// --- Types ---

export type NoticeType =
  | "maintenance"
  | "event"
  | "finance"
  | "traffic"
  | "health"
  | "meeting"
  | "holiday"
  | "sanitation"
  | "emergency"
  | "education";

export interface Notice {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  notice_type: NoticeType | string;
  ward_id: string | null;
  is_public: boolean;
  is_urgent: boolean;
  published_at: string;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // UI helper fields
  is_read?: boolean;
}

export interface NoticeAttachment {
  id: string;
  notice_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  created_at: string;
}

export interface GetNoticesParams {
  limit?: number;
  offset?: number;
  search?: string;
  wardId?: string;
  noticeType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  unreadOnly?: boolean;
}

// --- Service ---

export const noticesService = {
  /**
   * 1. Get List of Notices
   * Handles filtering, search, and visibility.
   * Note: Database RLS handles "Public OR My Ward" automatically.
   */
  async getUserNotices({
    limit = 10,
    offset = 0,
    search,
    wardId,
    noticeType,
    dateFrom,
    dateTo,
    unreadOnly = false,
  }: GetNoticesParams) {
    const supabase = createClient();
    const now = new Date().toISOString();

    // Base query for active, published notices
    let query = supabase
      .from("notices")
      .select("*", { count: "exact" })
      .lte("published_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`);

    // Filter by search keywords
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Filter by specific Ward (if 'all' isn't selected)
    if (wardId && wardId !== "all") {
      query = query.eq("ward_id", wardId);
    }

    // Filter by Notice Category
    if (noticeType && noticeType !== "all") {
      query = query.eq("notice_type", noticeType);
    }

    // Date Range Filtering
    if (dateFrom) {
      query = query.gte("published_at", dateFrom.toISOString());
    }
    if (dateTo) {
      const nextDay = new Date(dateTo);
      nextDay.setHours(23, 59, 59, 999);
      query = query.lte("published_at", nextDay.toISOString());
    }

    // Execute with sorting (Urgent first, then Newest)
    const { data: notices, count, error } = await query
      .order("is_urgent", { ascending: false })
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching notices:", error.message);
      return { notices: [], total: 0 };
    }

    // Match read receipts for these notices
    const noticeIds = notices?.map((n) => n.id) || [];
    let readIds = new Set<string>();

    if (noticeIds.length > 0) {
      const { data: readData } = await supabase
        .from("user_notice_reads")
        .select("notice_id")
        .in("notice_id", noticeIds);

      if (readData) {
        readIds = new Set(readData.map((r) => r.notice_id));
      }
    }

    // Map the status back to the objects
    let processedNotices = (notices as Notice[]).map((n) => ({
      ...n,
      is_read: readIds.has(n.id),
    }));

    // In-memory filter for Unread Only (simplifies complex SQL joins)
    if (unreadOnly) {
      processedNotices = processedNotices.filter((n) => !n.is_read);
    }

    return {
      notices: processedNotices,
      total: unreadOnly ? processedNotices.length : (count || 0),
    };
  },

  /**
   * 2. Get Detailed Notice
   * Fetches notice data, attachments, and read status in parallel.
   */
  async getNoticeById(id: string) {
    const supabase = createClient();

    const [noticeRes, attachmentsRes, readRes] = await Promise.all([
      supabase.from("notices").select("*").eq("id", id).single(),
      supabase.from("notice_attachments").select("*").eq("notice_id", id),
      supabase.from("user_notice_reads").select("id").eq("notice_id", id).maybeSingle(),
    ]);

    if (noticeRes.error) throw noticeRes.error;

    return {
      notice: noticeRes.data as Notice,
      attachments: (attachmentsRes.data || []) as NoticeAttachment[],
      isRead: !!readRes.data,
    };
  },

  /**
   * 3. Mark as Read
   * Uses upsert to ensure we don't create duplicate records.
   */
  async markNoticeAsRead(noticeId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("user_notice_reads")
      .upsert(
        { user_id: user.id, notice_id: noticeId },
        { onConflict: "user_id,notice_id" }
      );

    if (error) console.error("Mark Read Error:", error.message);
  },

  /**
   * 4. Get Unread Count
   * Compares total visible notices vs notices marked as read.
   */
  async getUnreadNoticeCount() {
    const supabase = createClient();
    const now = new Date().toISOString();

    // 1. Total notices visible (RLS applies here)
    const { count: totalCount, error: countError } = await supabase
      .from("notices")
      .select("id", { count: "exact", head: true })
      .lte("published_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`);

    if (countError) return 0;

    // 2. Total read receipts for current user
    const { count: readCount, error: readError } = await supabase
      .from("user_notice_reads")
      .select("id", { count: "exact", head: true });

    if (readError) return 0;

    return Math.max(0, (totalCount || 0) - (readCount || 0));
  },
};