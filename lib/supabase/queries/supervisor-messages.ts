import type { SupabaseClient } from "@supabase/supabase-js";

export const supervisorMessagesQueries = {
  /**
   * Optimized: Fetches all conversations and hydrates user profiles efficiently
   */
  async getConversations(client: SupabaseClient, userId: string) {
    // 1. Get raw conversations
    const { data: conversations, error } = await client
      .from("message_conversations")
      .select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    if (!conversations || conversations.length === 0) return [];

    // 2. Collect IDs
    const otherUserIds = conversations.map((c) =>
      c.participant_1 === userId ? c.participant_2 : c.participant_1
    );

    // 3. Fetch profiles (using the correct column name 'profile_photo_url')
    const { data: profiles } = await client
      .from("user_profiles")
      .select("user_id, full_name, profile_photo_url")
      .in("user_id", otherUserIds);

    // 4. Map Data
    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

    return conversations.map((conv) => {
      const otherId =
        conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
      const profile = profileMap.get(otherId);

      return {
        ...conv,
        other_user: {
          id: otherId,
          name: profile?.full_name || "Unknown User",
          // Map database column to UI property
          avatar_url: profile?.profile_photo_url,
        },
      };
    });
  },

  /**
   * Fetches messages for a specific conversation
   */
  async getMessages(client: SupabaseClient, conversationId: string) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .select(
        `
        id, 
        conversation_id, 
        sender_id, 
        message_text, 
        created_at, 
        is_read,
        sender:users!supervisor_staff_messages_sender_id_fkey(
           profile:user_profiles(full_name, profile_photo_url)
        )
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((msg: any) => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      message_text: msg.message_text,
      created_at: msg.created_at,
      is_read: msg.is_read,
      // Safely access nested profile data
      sender_name: msg.sender?.profile?.full_name || "Unknown",
      // Map database column to UI property
      sender_avatar: msg.sender?.profile?.profile_photo_url,
    }));
  },

  /**
   * Send a new message
   */
  async sendMessage(
    client: SupabaseClient,
    conversationId: string,
    senderId: string,
    text: string
  ) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: text,
      })
      .select() // <--- CRITICAL: This ensures the new message is returned
      .single();

    if (error) throw error;

    // Update conversation timestamp asynchronously
    await client
      .from("message_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.substring(0, 50),
      })
      .eq("id", conversationId);

    return data;
  },
  /**
   * Create or find a conversation
   */
  async createConversation(
    client: SupabaseClient,
    user1: string,
    user2: string
  ) {
    const { data: existing } = await client
      .from("message_conversations")
      .select("id")
      .or(
        `and(participant_1.eq.${user1},participant_2.eq.${user2}),and(participant_1.eq.${user2},participant_2.eq.${user1})`
      )
      .maybeSingle();

    if (existing) return existing.id;

    const { data, error } = await client
      .from("message_conversations")
      .insert({
        participant_1: user1,
        participant_2: user2,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  },

  /**
   * Mark messages as read
   */
  async markAsRead(
    client: SupabaseClient,
    conversationId: string,
    userId: string
  ) {
    const { error } = await client
      .from("supervisor_staff_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);

    if (error) console.error("Error marking messages as read:", error);
  },

  /**
   * Send a broadcast (Team Announcement)
   */
  async broadcastMessage(
    client: SupabaseClient,
    payload: {
      senderId: string;
      title: string;
      body: string;
      recipients: string[];
      channels: { inApp: boolean; email: boolean; sms: boolean };
      urgency: string;
      scheduledAt: string | null;
    }
  ) {
    const { data, error } = await client
      .from("team_announcements")
      .insert({
        supervisor_id: payload.senderId,
        title: payload.title,
        content: payload.body,
        target_staff_ids: payload.recipients,
        announcement_type: payload.urgency === "urgent" ? "urgent" : "general",
        is_published: !payload.scheduledAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get broadcast history
   */
  async getBroadcastHistory(client: SupabaseClient, supervisorId: string) {
    const { data, error } = await client
      .from("team_announcements")
      .select("*")
      .eq("supervisor_id", supervisorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};