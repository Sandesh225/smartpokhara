import { supabase } from "@/lib/supabase/client";

export const supervisorMessagesSubscription = {
  /**
   * Listens for new messages in a specific conversation.
   */
  subscribeToConversation(conversationId: string, onNewMessage: (msg: any) => void) {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supervisor_staff_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Optional: Listen for updates to the conversation list (new chats starting).
   */
  subscribeToConversationList(userId: string, onUpdate: () => void) {
    const channel = supabase
      .channel(`user-conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT or UPDATE
          schema: "public",
          table: "message_conversations",
        },
        () => onUpdate()
      )
      .subscribe();
      
    return channel;
  },
  
  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
};