import type { SupabaseClient } from "@supabase/supabase-js";

export const staffMessagesQueries = {
  /**
   * Get list of conversations for this staff member.
   */
  async getConversations(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("message_conversations")
      .select("*")
      .or(`participant_1.eq.${staffId},participant_2.eq.${staffId}`)
      .order("last_message_at", { ascending: false });

    if (error) return [];

    // Hydrate other participant (Supervisor/Colleague)
    return Promise.all(
      data.map(async (conv) => {
        const otherId = conv.participant_1 === staffId ? conv.participant_2 : conv.participant_1;
        
        const { data: user } = await client
          .from("user_profiles")
          .select("full_name, avatar_url")
          .eq("user_id", otherId)
          .single();

        return {
          ...conv,
          other_user: {
            id: otherId,
            name: user?.full_name || "Unknown",
            avatar_url: user?.avatar_url
          }
        };
      })
    );
  },

  /**
   * Get messages for a specific conversation.
   */
  async getMessages(client: SupabaseClient, conversationId: string) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .select(`
        id, conversation_id, sender_id, message_text, created_at, is_read,
        sender:user_profiles!supervisor_staff_messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return [];
    return data;
  },

  /**
   * Send a message.
   */
  async sendMessage(client: SupabaseClient, conversationId: string, senderId: string, text: string) {
    const { data, error } = await client
      .from("supervisor_staff_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: text
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await client
      .from("message_conversations")
      .update({ 
        last_message_at: new Date().toISOString(),
        last_message_preview: text.substring(0, 50) 
      })
      .eq("id", conversationId);

    return data;
  }
};