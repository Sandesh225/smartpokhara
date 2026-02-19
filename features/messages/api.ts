import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { Message, Conversation, SendMessageData } from "./types";

type Client = SupabaseClient<Database>;

export const messagesApi = {
  /**
   * Get messages for a conversation
   * Table: supervisor_staff_messages
   */
  async getMessages(client: Client, conversationId: string) {
    const { data, error } = await (client as any)
      .from("supervisor_staff_messages")
      .select(`
        id, conversation_id, sender_id, message_text, is_read, created_at,
        sender:users!supervisor_staff_messages_sender_id_fkey(
           profile:user_profiles(full_name, profile_photo_url)
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    return (data || []).map((msg: any) => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      message_text: msg.message_text,
      is_read: msg.is_read,
      created_at: msg.created_at,
      sender: {
        full_name: msg.sender?.profile?.full_name,
        avatar_url: msg.sender?.profile?.profile_photo_url,
      }
    })) as Message[];
  },

  /**
   * Send a message
   * Table: supervisor_staff_messages + message_conversations
   */
  async sendMessage(client: Client, conversationId: string, senderId: string, text: string) {
    const { data, error } = await (client as any)
      .from("supervisor_staff_messages")
      .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: text
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update conversation preview
    await (client as any).from("message_conversations").update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.substring(0, 50),
    }).eq("id", conversationId);

    return data;
  },

  /**
   * Alias for getMessages
   */
  async getThreadMessages(client: Client, conversationId: string) {
      return this.getMessages(client, conversationId);
  },

  /**
   * Get conversations for a user
   * Table: message_conversations
   */
  async getConversations(client: Client, userId: string) {
    const { data: convs, error } = await (client as any)
      .from("message_conversations")
      .select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error || !convs || convs.length === 0) return [];

    const otherIds = (convs as any[]).map((c: any) => c.participant_1 === userId ? c.participant_2 : c.participant_1);

    const { data: profiles } = await (client as any)
      .from("user_profiles")
      .select("user_id, full_name, profile_photo_url")
      .in("user_id", otherIds);

    const profileMap = new Map((profiles as any[])?.map((p: any) => [p.user_id, p]));

    return (convs as any[]).map((c: any) => {
      const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
      const profile = profileMap.get(otherId);
      return {
        id: c.id,
        participant_1: c.participant_1,
        participant_2: c.participant_2,
        last_message_at: c.last_message_at,
        last_message_preview: c.last_message_preview,
        created_at: c.created_at,
        otherUserName: (profile as any)?.full_name || "Unknown",
        otherUserAvatar: (profile as any)?.profile_photo_url,
        other_user: {
          name: (profile as any)?.full_name || "Unknown",
          avatar_url: (profile as any)?.profile_photo_url
        }
      };
    }) as Conversation[];
  },

  /**
   * Create or find a conversation
   * Table: message_conversations
   */
  async createConversation(client: Client, participants: string[]) {
    if (participants.length < 2) throw new Error("Need at least 2 participants");
    const [user1, user2] = participants;

    // Check if conversation already exists
    const { data: existing } = await (client as any)
      .from("message_conversations")
      .select("id")
      .or(`and(participant_1.eq.${user1},participant_2.eq.${user2}),and(participant_1.eq.${user2},participant_2.eq.${user1})`)
      .maybeSingle();

    if (existing) return (existing as any).id as string;

    const { data: newConv, error } = await (client as any)
      .from("message_conversations")
      .insert({ participant_1: user1, participant_2: user2, last_message_at: new Date().toISOString() })
      .select("id")
      .single();

    if (error) throw error;
    return (newConv as any).id as string;
  },

  /**
   * Create a support ticket conversation (via RPC if available, else direct insert)
   */
  async createSupportTicket(client: Client, userId: string) {
      // Try RPC first, fall back to direct insert
      try {
        const { data, error } = await (client as any).rpc("create_support_conversation", {
            p_user_id: userId
        });
        if (error) throw error;
        return data;
      } catch {
        // Fallback: create conversation with a default support user
        return this.createConversation(client, [userId, userId]);
      }
  },

  /**
   * Get broadcast/announcement history
   * Table: team_announcements
   */
  async getBroadcastHistory(client: Client, senderId: string) {
    const { data, error } = await (client as any)
      .from("team_announcements")
      .select("*")
      .eq("supervisor_id", senderId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Broadcast a message/announcement
   * Table: team_announcements
   */
  async broadcastMessage(client: Client, payload: any) {
      const { data, error } = await (client as any)
        .from("team_announcements")
        .insert({
          supervisor_id: payload.senderId || payload.sender_id,
          title: payload.title,
          content: payload.body || payload.content,
          target_staff_ids: payload.recipients || payload.target_ids,
          announcement_type: payload.urgency === "urgent" ? "urgent" : "general",
          is_published: !payload.scheduledAt && !payload.isScheduled,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
  },

  /**
   * Mark messages as read in a conversation
   * Table: supervisor_staff_messages
   */
  async markAsRead(client: Client, conversationId: string, userId: string) {
      const { error } = await (client as any)
        .from("supervisor_staff_messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("is_read", false);
      if (error) throw error;
  }
};
