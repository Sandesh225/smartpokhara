import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES (Kept exactly as provided)
// ============================================================================

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

// ============================================================================
// INTERNAL UTILITIES
// ============================================================================

const getSupabase = () => createClient();

const handleNoticeError = (context: string, error: any) => {
  console.error(`Error in ${context}:`, error?.message || error);
  return { notices: [], total: 0 }; // Consistent with original fallback
};

// ============================================================================
// SERVICE
// ============================================================================

export const noticesService = {
  /**
   * 1. Get List of Notices
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
    const supabase = getSupabase();
    const now = new Date().toISOString();

    try {
      let query = supabase
        .from("notices")
        .select("*", { count: "exact" })
        .lte("published_at", now)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      if (wardId && wardId !== "all") query = query.eq("ward_id", wardId);
      if (noticeType && noticeType !== "all") query = query.eq("notice_type", noticeType);
      if (dateFrom) query = query.gte("published_at", dateFrom.toISOString());
      
      if (dateTo) {
        const nextDay = new Date(dateTo);
        nextDay.setHours(23, 59, 59, 999);
        query = query.lte("published_at", nextDay.toISOString());
      }

      const { data: notices, count, error } = await query
        .order("is_urgent", { ascending: false })
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Match read receipts
      const noticeIds = notices?.map((n) => n.id) || [];
      let readIds = new Set<string>();

      if (noticeIds.length > 0) {
        const { data: readData } = await supabase
          .from("user_notice_reads")
          .select("notice_id")
          .in("notice_id", noticeIds);
        if (readData) readIds = new Set(readData.map((r) => r.notice_id));
      }

      let processedNotices = (notices as Notice[]).map((n) => ({
        ...n,
        is_read: readIds.has(n.id),
      }));

      if (unreadOnly) {
        processedNotices = processedNotices.filter((n) => !n.is_read);
      }

      return {
        notices: processedNotices,
        total: unreadOnly ? processedNotices.length : (count || 0),
      };
    } catch (error) {
      return handleNoticeError("getUserNotices", error);
    }
  },

  /**
   * 2. Get Detailed Notice
   */
  async getNoticeById(id: string) {
    const supabase = getSupabase();

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
   */
  async markNoticeAsRead(noticeId: string) {
    const supabase = getSupabase();
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
   */
  async getUnreadNoticeCount() {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    try {
      const [totalRes, readRes] = await Promise.all([
        supabase.from("notices").select("id", { count: "exact", head: true })
          .lte("published_at", now)
          .or(`expires_at.is.null,expires_at.gt.${now}`),
        supabase.from("user_notice_reads").select("id", { count: "exact", head: true })
      ]);

      if (totalRes.error || readRes.error) return 0;

      return Math.max(0, (totalRes.count || 0) - (readRes.count || 0));
    } catch {
      return 0;
    }
  },
};