import { SupabaseClient } from "@supabase/supabase-js";

export const staffMessagesQueries = {
  /**
   * 1. GET ALL ACTIVE CONVERSATIONS (WhatsApp Style)
   * This ignores "who is supervisor" and just shows actual chat history.
   */
  async getConversations(client: SupabaseClient, userId: string) {
    // A. Fetch conversations
    const { data: convs, error } = await client
      .from("message_conversations")
      .select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) return [];

    // B. Get the "Other Person's" IDs
    const otherIds = convs.map((c) =>
      c.participant_1 === userId ? c.participant_2 : c.participant_1
    );

    if (otherIds.length === 0) return [];

    // C. Hydrate Names/Avatars
    const { data: profiles } = await client
      .from("user_profiles")
      .select("user_id, full_name, profile_photo_url")
      .in("user_id", otherIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

    return convs.map((c) => {
      const otherId =
        c.participant_1 === userId ? c.participant_2 : c.participant_1;
      const profile = profileMap.get(otherId);
      return {
        id: c.id,
        otherUserName: profile?.full_name || "Support Staff",
        otherUserAvatar: profile?.profile_photo_url,
        lastMessage: c.last_message_preview,
        lastMessageTime: c.last_message_at,
      };
    });
  },

  /**
   * 2. "EMERGENCY" CONNECT (The Fallback)
   * If staff has NO chat, this finds ANY admin to talk to.
   */
  async createSupportTicket(client: SupabaseClient, staffId: string) {
    // Try to find a senior admin first
    const { data: admin } = await client
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin") // or 'supervisor'
      .limit(1)
      .maybeSingle();

    if (!admin) throw new Error("No support staff available.");

    // Create chat with this admin
    const { data: newConv, error } = await client
      .from("message_conversations")
      .insert({
        participant_1: staffId,
        participant_2: admin.user_id,
        last_message_preview: "Support request started",
      })
      .select()
      .single();

    if (error) throw error;
    return newConv.id;
  },

  /**
   * 3. GET MESSAGES FOR A THREAD
   */
  async getThreadMessages(client: SupabaseClient, conversationId: string) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .select(
        `
        id, sender_id, message_text, created_at,
        sender:users!supervisor_staff_messages_sender_id_fkey(
           profile:user_profiles(full_name)
        )
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return [];

    return data.map((m: any) => ({
      id: m.id,
      content: m.message_text,
      senderId: m.sender_id,
      senderName: m.sender?.profile?.full_name || "User",
      createdAt: m.created_at,
    }));
  },

  /**
   * 4. SEND MESSAGE
   */
  async sendMessage(
    client: SupabaseClient,
    conversationId: string,
    senderId: string,
    text: string
  ) {
    // Insert
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: text,
      })
      .select()
      .single();

    if (error) throw error;

    // Update Preview
    await client
      .from("message_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.substring(0, 50),
      })
      .eq("id", conversationId);

    return data;
  },
};