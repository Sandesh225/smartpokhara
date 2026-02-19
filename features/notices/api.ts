import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { ProjectNotice, NoticeFilters, CMSPage, CMSPageInput } from "./types";

type Client = SupabaseClient<Database>;

export const noticesApi = {
  /**
   * NOTICES API
   */

  async getNotices(client: Client, params: NoticeFilters) {
    const { 
      search, wardId, type, userId,
      page = 1, limit = 10, 
      publishedOnly = true, unreadOnly = false 
    } = params;
    
    let query = client.from("notices").select(`
      *,
      ward:wards(id, ward_number, name),
      creator:users!notices_created_by_fkey(
         profile:user_profiles(full_name)
      )
    `, { count: "exact" });
    const now = new Date().toISOString();

    if (publishedOnly) {
      query = query
        .lte("published_at", now)
        .or(`expires_at.is.null,expires_at.gt.${now}`);
    }

    if (wardId && wardId !== "all") {
      query = query.eq("ward_id", wardId);
    }

    if (type && type !== "all") {
      query = query.eq("notice_type", type);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    query = query
      .order("is_urgent", { ascending: false })
      .order("published_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    let notices = (data || []) as any[];

    if (userId && notices.length > 0) {
      const ids = notices.map(n => n.id);
      const { data: reads } = await (client as any)
        .from("user_notice_reads")
        .select("notice_id")
        .eq("user_id", userId)
        .in("notice_id", ids);
      
      const readSet = new Set((reads || []).map((r: any) => r.notice_id));
      
      notices = notices.map(n => ({
        ...n,
        is_read: readSet.has(n.id),
        creator: { full_name: (n as any).creator?.profile?.full_name || "Admin" }
      }));

      if (unreadOnly) {
        notices = notices.filter(n => !n.is_read);
      }
    } else {
      notices = notices.map(n => ({
        ...n,
        creator: { full_name: (n as any).creator?.profile?.full_name || "Admin" }
      }));
    }

    return { data: notices, count: unreadOnly ? notices.length : (count || 0) };
  },

  async getNoticeById(client: Client, id: string) {
    const { data, error } = await client.from("notices").select("*").eq("id", id).single();
    if (error) throw error;

    const { data: attachments } = await client.from("notice_attachments").select("*").eq("notice_id", id);
    
    return { ...data, attachments: attachments || [] } as ProjectNotice;
  },

  async createNotice(client: Client, input: Partial<ProjectNotice> & { is_public?: boolean }) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const finalWardId = (input.is_public || !input.ward_id || input.ward_id === "all") ? null : input.ward_id;
    
    const { data, error } = await client.from("notices").insert({
      ...input,
      ward_id: finalWardId,
      created_by: user.id,
      published_at: input.published_at || new Date().toISOString()
    } as any).select().single();

    if (error) throw error;
    return data as ProjectNotice;
  },

  async updateNotice(client: Client, id: string, updates: Partial<ProjectNotice> & { is_public?: boolean }) {
    if (updates.is_public) updates.ward_id = null;
    
    const { error } = await client.from("notices").update(updates as any).eq("id", id);
    if (error) throw error;
  },

  async deleteNotice(client: Client, id: string) {
    const { error } = await client.from("notices").delete().eq("id", id);
    if (error) throw error;
  },

  async markAsRead(client: Client, noticeId: string, userId: string) {
    await (client as any).from("user_notice_reads").upsert(
      { user_id: userId, notice_id: noticeId }, 
      { onConflict: "user_id,notice_id" }
    );
  },

  async getUnreadCount(client: Client, userId: string) {
    const now = new Date().toISOString();
    const { count: total } = await client.from("notices")
      .select("id", { count: "exact", head: true })
      .lte("published_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`);
    
    const { count: read } = await (client as any).from("user_notice_reads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    
    return Math.max(0, (total || 0) - (read || 0));
  },

  /**
   * CONTENT API (CMS)
   */

  async getPages(client: Client) {
    const { data, error } = await (client as any)
      .from("cms_pages")
      .select(`
        *,
        author:users!cms_pages_author_id_fkey(
          profile:user_profiles(full_name)
        )
      `)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map((p: any) => ({
      ...p,
      author_name: p.author?.profile?.full_name || "System"
    })) as CMSPage[];
  },

  async getPageById(client: Client, id: string) {
    const { data, error } = await (client as any).from("cms_pages").select("*").eq("id", id).single();
    if (error) throw error;
    return data as CMSPage;
  },

  async getPageBySlug(client: Client, slug: string) {
    const { data, error } = await (client as any).from("cms_pages").select("*").eq("slug", slug).eq("status", "published").single();
    if (error) return null;
    return data as CMSPage;
  },

  async createPage(client: Client, input: CMSPageInput) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await (client as any).from("cms_pages").insert({
      ...input,
      author_id: user.id,
      published_at: input.status === "published" ? new Date().toISOString() : null
    }).select().single();

    if (error) throw error;
    return data as CMSPage;
  },

  async updatePage(client: Client, id: string, updates: Partial<CMSPageInput>) {
    const finalUpdates: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.status === "published" && !finalUpdates.published_at) {
      finalUpdates.published_at = new Date().toISOString();
    }
    
    const { error } = await (client as any).from("cms_pages").update(finalUpdates).eq("id", id);
    if (error) throw error;
  },

  async deletePage(client: Client, id: string) {
    const { error } = await (client as any).from("cms_pages").delete().eq("id", id);
    if (error) throw error;
  }
};
