import { SupabaseClient } from "@supabase/supabase-js";
import { CMSPage, Notice, NoticeInput, PageInput } from "@/types/admin-content";

export const adminContentQueries = {
  // --- NOTICES ---

  async getAllNotices(client: SupabaseClient) {
    const { data, error } = await client
      .from("notices")
      .select(
        `
        *,
        ward:wards(id, ward_number, name),
        creator:users!notices_created_by_fkey(
           profile:user_profiles(full_name)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((n: any) => ({
      ...n,
      creator: { full_name: n.creator?.profile?.full_name || "Admin" },
    })) as Notice[];
  },

  // THE FIX IS IN THIS FUNCTION
  async createNotice(client: SupabaseClient, input: NoticeInput) {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Handle Ward Logic Safely
    // If it's public, ward_id MUST be null.
    // If ward_id is "all" or empty string, it MUST be null.
    let finalWardId = input.ward_id;
    if (input.is_public || input.ward_id === "all" || !input.ward_id) {
      finalWardId = null;
    }

    // 2. Handle Published Date Safely
    // We subtract 1 minute from the current time to ensure the notice isn't
    // accidentally "in the future" due to slight server/client clock differences.
    const safePublishedAt = input.published_at
      ? input.published_at
      : new Date(Date.now() - 60000).toISOString(); // 1 min ago

    const payload = {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      notice_type: input.notice_type,
      ward_id: finalWardId,
      is_public: input.is_public,
      is_urgent: input.is_urgent,
      published_at: safePublishedAt,
      expires_at: input.expires_at || null,
      created_by: user.id,
    };

    console.log("Admin Posting Payload:", payload); // Debugging

    const { data, error } = await client
      .from("notices")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase Create Notice Error:", error);
      throw new Error(error.message);
    }

    return data;
  },

  async updateNotice(
    client: SupabaseClient,
    id: string,
    input: Partial<NoticeInput>
  ) {
    const updates: any = { ...input };

    // Logic consistency for updates
    if (updates.is_public === true) {
      updates.ward_id = null;
    } else if (updates.ward_id === "all") {
      updates.ward_id = null;
    }

    const { error } = await client.from("notices").update(updates).eq("id", id);

    if (error) throw error;
  },

  async deleteNotice(client: SupabaseClient, id: string) {
    const { error } = await client.from("notices").delete().eq("id", id);
    if (error) throw error;
  },

  // --- PAGES (CMS) ---
  async getAllPages(client: SupabaseClient) {
    const { data, error } = await client
      .from("cms_pages")
      .select(
        `
        *,
        author:users!cms_pages_author_id_fkey(
           profile:user_profiles(full_name)
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      author: { full_name: p.author?.profile?.full_name || "System" },
    })) as CMSPage[];
  },

  async getPageById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("cms_pages")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as CMSPage;
  },

  async createPage(client: SupabaseClient, input: PageInput) {
    const {
      data: { user },
    } = await client.auth.getUser();
    const { data, error } = await client
      .from("cms_pages")
      .insert({
        ...input,
        author_id: user?.id,
        published_at:
          input.status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePage(
    client: SupabaseClient,
    id: string,
    input: Partial<PageInput>
  ) {
    const updates: any = { ...input, updated_at: new Date().toISOString() };
    if (input.status === "published")
      updates.published_at = new Date().toISOString();
    const { error } = await client
      .from("cms_pages")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  },

  async deletePage(client: SupabaseClient, id: string) {
    const { error } = await client.from("cms_pages").delete().eq("id", id);
    if (error) throw error;
  },
};