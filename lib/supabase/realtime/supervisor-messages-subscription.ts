import { supabase } from "@/lib/supabase/client";

export const supervisorMessagesSubscription = {
  subscribeToConversation(
    conversationId: string,
    onNewMessage: (msg: any) => void
  ) {
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

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  },
};