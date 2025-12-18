import type { SupabaseClient } from "@supabase/supabase-js";

export const supervisorMessagesQueries = {
  // ... (getConversations, getMessages, sendMessage, createConversation from previous turn)
  
  async getConversations(client: SupabaseClient, userId: string) {
    const { data, error } = await client
      .from("message_conversations")
      .select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    return Promise.all(
      (data || []).map(async (conv) => {
        const otherId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
        
        let name = "Unknown User";
        let avatar = null;

        const { data: profile } = await client.from("user_profiles").select("full_name, avatar_url").eq("user_id", otherId).single();
        if (profile) {
            name = profile.full_name;
            avatar = profile.avatar_url;
        } else {
            const { data: user } = await client.from("users").select("email").eq("id", otherId).single();
            if (user) name = user.email;
        }
        
        return {
          ...conv,
          other_user: { id: otherId, name, avatar_url: avatar }
        };
      })
    );
  },

  async getMessages(client: SupabaseClient, conversationId: string) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .select(`
        id, conversation_id, sender_id, message_text, created_at, is_read,
        sender:user_profiles!supervisor_staff_messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(client: SupabaseClient, conversationId: string, senderId: string, text: string) {
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

    await client
      .from("message_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.substring(0, 50),
      })
      .eq("id", conversationId);

    return data;
  },

  async createConversation(client: SupabaseClient, user1: string, user2: string) {
    const { data: existing } = await client
      .from("message_conversations")
      .select("id")
      .or(`and(participant_1.eq.${user1},participant_2.eq.${user2}),and(participant_1.eq.${user2},participant_2.eq.${user1})`)
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
   * Marks all messages in a conversation as read for the current user.
   */
  async markAsRead(client: SupabaseClient, conversationId: string, userId: string) {
    const { error } = await client
      .from("supervisor_staff_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId) // Only mark messages sent by others
      .eq("is_read", false); // Only update unread ones

    if (error) console.error("Error marking messages as read:", error);
  },

  /**
   * Sends a broadcast announcement to team members.
   * Maps to 'team_announcements' table.
   */
  async broadcastMessage(client: SupabaseClient, payload: {
    senderId: string;
    title: string;
    body: string;
    recipients: string[]; // Array of staff IDs
    channels: { inApp: boolean; email: boolean; sms: boolean };
    urgency: string;
    scheduledAt: string | null;
  }) {
    const { data, error } = await client
      .from("team_announcements")
      .insert({
        supervisor_id: payload.senderId,
        title: payload.title,
        content: payload.body,
        target_staff_ids: payload.recipients,
        announcement_type: payload.urgency === 'urgent' ? 'urgent' : 'general',
        is_published: !payload.scheduledAt, // If scheduled, it's not published yet
        // Store extra metadata in a JSONB column if your schema supports it, or rely on triggers
        // metadata: { channels: payload.channels, scheduledAt: payload.scheduledAt } 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetches broadcast history for a supervisor.
   */
  async getBroadcastHistory(client: SupabaseClient, supervisorId: string) {
    const { data, error } = await client
      .from("team_announcements")
      .select("*")
      .eq("supervisor_id", supervisorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }
};