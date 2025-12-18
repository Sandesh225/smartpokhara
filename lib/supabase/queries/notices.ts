// lib/supabase/queries/notices.ts
import { supabase } from '../client';
import type { Database } from '../../types/database.types';

export type Notice = Database['public']['Tables']['notices']['Row'];
export type NoticeAttachment = Database['public']['Tables']['notice_attachments']['Row'];
export type UserNoticeRead = Database['public']['Tables']['user_notice_reads']['Row'];

export interface NoticeWithExtras extends Notice {
  ward_number?: number | null;
  has_attachments: boolean;
  is_read: boolean;
}

export interface GetNoticesParams {
  limit?: number;
  offset?: number;
  wardId?: string | null;
  noticeType?: string | null;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  unreadOnly?: boolean;
}

export interface GetNoticesResponse {
  notices: NoticeWithExtras[];
  total: number;
}

export const noticesService = {
  // ========================================================================
  // 1. GET NOTICES FOR CURRENT USER
  // ========================================================================
  async getUserNotices(params?: GetNoticesParams): Promise<GetNoticesResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;
      const { limit = 20, offset = 0, wardId, noticeType, search, dateFrom, dateTo, unreadOnly = false } = params || {};
      
      // Get user profile for ward
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('ward_id')
        .eq('user_id', userId)
        .single();

      const effectiveWardId = wardId ?? userProfile?.ward_id ?? null;
      const nowIso = new Date().toISOString();

      // Base query
      let query = supabase
        .from('notices')
        .select(
          `*,
          ward:wards!notices_ward_id_fkey(ward_number)`,
          { count: 'exact' }
        )
        .lte('published_at', nowIso)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Audience filter
      if (effectiveWardId) {
        query = query.or(`is_public.eq.true,ward_id.eq.${effectiveWardId}`);
      } else {
        query = query.eq('is_public', true);
      }

      // Additional filters
      if (noticeType) {
        query = query.eq('notice_type', noticeType);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }
      
      if (dateFrom) {
        query = query.gte('published_at', dateFrom.toISOString());
      }
      
      if (dateTo) {
        query = query.lte('published_at', dateTo.toISOString());
      }
      
      if (wardId) {
        query = query.eq('ward_id', wardId);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      const rawNotices = (data || []) as any[];
      
      if (rawNotices.length === 0) {
        return { notices: [], total: 0 };
      }

      const noticeIds = rawNotices.map(n => n.id);
      
      // Get read status in one query
      const { data: readRows } = await supabase
        .from('user_notice_reads')
        .select('notice_id')
        .eq('user_id', userId)
        .in('notice_id', noticeIds);

      const readSet = new Set((readRows || []).map(r => r.notice_id));

      // Process notices with extras
      const noticesWithExtras: NoticeWithExtras[] = rawNotices.map(row => ({
        ...(row as Notice),
        ward_number: row.ward?.ward_number ?? null,
        has_attachments: false, // Will be updated if needed
        is_read: readSet.has(row.id),
      }));

      const filtered = unreadOnly 
        ? noticesWithExtras.filter(n => !n.is_read)
        : noticesWithExtras;

      return {
        notices: filtered,
        total: unreadOnly ? filtered.length : count ?? filtered.length,
      };

    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  },

  // ========================================================================
  // 2. GET NOTICE BY ID
  // ========================================================================
  async getNoticeById(id: string): Promise<{
    notice: Notice & { ward_number?: number | null };
    attachments: NoticeAttachment[];
    isRead: boolean;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const [noticeResult, attachmentsResult] = await Promise.all([
        supabase
          .from('notices')
          .select(`*, ward:wards!notices_ward_id_fkey(ward_number)`)
          .eq('id', id)
          .single(),
        supabase
          .from('notice_attachments')
          .select('*')
          .eq('notice_id', id)
          .order('created_at', { ascending: true })
      ]);

      if (noticeResult.error) throw noticeResult.error;
      if (!noticeResult.data) throw new Error('Notice not found');

      const [readRecord] = await Promise.all([
        supabase
          .from('user_notice_reads')
          .select('id')
          .eq('notice_id', id)
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      const row: any = noticeResult.data;
      
      return {
        notice: {
          ...(row as Notice),
          ward_number: row.ward?.ward_number ?? null,
        },
        attachments: (attachmentsResult.data || []) as NoticeAttachment[],
        isRead: !!readRecord.data,
      };

    } catch (error) {
      console.error('Error fetching notice:', error);
      throw error;
    }
  },

  // ========================================================================
  // 3. MARK NOTICE AS READ
  // ========================================================================
  async markNoticeAsRead(noticeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('user_notice_reads')
        .upsert(
          {
            user_id: user.id,
            notice_id: noticeId,
            read_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,notice_id' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notice as read:', error);
    }
  },

  // ========================================================================
  // 4. GET UNREAD NOTICE COUNT
  // ========================================================================
  async getUnreadNoticeCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return 0;

      const userId = user.id;
      
      // Get user's ward
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('ward_id')
        .eq('user_id', userId)
        .single();

      const nowIso = new Date().toISOString();

      // Get relevant notices
      const { data: notices } = await supabase
        .from('notices')
        .select('id')
        .lte('published_at', nowIso)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .or(`is_public.eq.true,ward_id.eq.${userProfile?.ward_id ?? ''}`);

      const allIds = (notices || []).map(n => n.id);
      
      if (allIds.length === 0) {
        return 0;
      }

      // Get read notices
      const { data: readRows } = await supabase
        .from('user_notice_reads')
        .select('notice_id')
        .eq('user_id', userId)
        .in('notice_id', allIds);

      const readSet = new Set((readRows || []).map(r => r.notice_id));
      
      return allIds.filter(id => !readSet.has(id)).length;

    } catch (error) {
      console.error('Error counting unread notices:', error);
      return 0;
    }
  },

  // ========================================================================
  // 5. REAL-TIME SUBSCRIPTION
  // ========================================================================
  subscribeToNotices(
    userId: string,
    wardId: string | null,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`user-notices-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notices',
        },
        async (payload) => {
          // Filter notices relevant to user
          const notice = payload.new;
          const isRelevant = notice.is_public || (wardId && notice.ward_id === wardId);
          
          if (isRelevant) {
            callback(payload);
          }
        }
      )
      .subscribe();
  },

  // ========================================================================
  // 6. GET DASHBOARD NOTICES (for dashboard)
  // ========================================================================
  async getDashboardNotices(limit: number = 5): Promise<Notice[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      // Get user's ward
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('ward_id')
        .eq('user_id', user.id)
        .single();

      const wardId = userProfile?.ward_id;
      const nowIso = new Date().toISOString();

      let query = supabase
        .from('notices')
        .select('*')
        .lte('published_at', nowIso)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (wardId) {
        query = query.or(`is_public.eq.true,ward_id.eq.${wardId}`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []) as Notice[];
    } catch (error) {
      console.error('Error fetching dashboard notices:', error);
      return [];
    }
  },
};