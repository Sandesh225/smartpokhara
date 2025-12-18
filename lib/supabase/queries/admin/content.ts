import { SupabaseClient } from "@supabase/supabase-js";
import { CMSPage, Notice, NoticeInput, PageInput } from "@/types/admin-content";

export const adminContentQueries = {
  // --- NOTICES ---

  async getAllNotices(client: SupabaseClient) {
    const { data, error } = await client
      .from("notices")
      .select(`
        *,
        ward:wards(id, ward_number, name),
        creator:users!notices_created_by_fkey(
           profile:user_profiles(full_name)
        )
      `)
      .order("is_urgent", { ascending: false })
      .order("published_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map((n: any) => ({
      ...n,
      creator: { full_name: n.creator?.profile?.full_name || 'Admin' }
    })) as Notice[];
  },

  async getNoticeById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("notices")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data as Notice;
  },

  async createNotice(client: SupabaseClient, input: NoticeInput) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Explicitly construct payload to sanitize undefined/empty values
    const payload = {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      notice_type: input.notice_type,
      // Convert 'all' or empty string to null for UUID field
      ward_id: (input.ward_id === 'all' || !input.ward_id) ? null : input.ward_id,
      is_public: input.is_public,
      is_urgent: input.is_urgent,
      published_at: input.published_at || new Date().toISOString(),
      expires_at: input.expires_at || null,
      created_by: user.id
    };

    console.log("Creating notice with payload:", payload);

    const { data, error } = await client
      .from("notices")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase Create Notice Error:", JSON.stringify(error, null, 2));
      throw new Error(error.message || "Database insert failed");
    }
    
    return data;
  },

  async updateNotice(client: SupabaseClient, id: string, input: Partial<NoticeInput>) {
    // Sanitize ward_id if it's present in the update
    const updates: any = { ...input };
    if ('ward_id' in updates) {
       updates.ward_id = (updates.ward_id === 'all' || !updates.ward_id) ? null : updates.ward_id;
    }

    const { error } = await client
      .from("notices")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  },

  async deleteNotice(client: SupabaseClient, id: string) {
    const { error } = await client
      .from("notices")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async getNoticeAnalytics(client: SupabaseClient, id: string) {
    // Placeholder logic for analytics
    return {
        unique_views: 0,
        total_sent: 0,
        click_through_rate: 0,
        ack_count: 0 
    };
  },

  // --- PAGES (CMS) ---
  // ... (Pages logic remains same, assuming it was working or out of scope for this specific error)
  async getAllPages(client: SupabaseClient) {
    const { data, error } = await client
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
        author: { full_name: p.author?.profile?.full_name || 'System' }
    })) as CMSPage[];
  },

  async getPageById(client: SupabaseClient, id: string) {
    const { data, error } = await client.from("cms_pages").select("*").eq("id", id).single();
    if (error) throw error;
    return data as CMSPage;
  },

  async createPage(client: SupabaseClient, input: PageInput) {
    const { data: { user } } = await client.auth.getUser();
    const { data, error } = await client.from("cms_pages").insert({
        ...input,
        author_id: user?.id,
        published_at: input.status === 'published' ? new Date().toISOString() : null
      }).select().single();
    if (error) throw error;
    return data;
  },

  async updatePage(client: SupabaseClient, id: string, input: Partial<PageInput>) {
    const updates: any = { ...input, updated_at: new Date().toISOString() };
    if (input.status === 'published') updates.published_at = new Date().toISOString();
    const { error } = await client.from("cms_pages").update(updates).eq("id", id);
    if (error) throw error;
  },

  async deletePage(client: SupabaseClient, id: string) {
    const { error } = await client.from("cms_pages").delete().eq("id", id);
    if (error) throw error;
  }
};