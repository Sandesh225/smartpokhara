import { SupabaseClient } from "@supabase/supabase-js";

export const subscribeToMessages = (
  client: SupabaseClient,
  conversationId: string,
  onNewMessage: (payload: any) => void
) => {
  const channel = client
    .channel(`messages-${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new); // Or a separate onUpdate callback if needed
      }
    )
    .subscribe();

  return channel;
};

export const unsubscribeFromMessages = (client: SupabaseClient, channel: any) => {
  client.removeChannel(channel);
};
