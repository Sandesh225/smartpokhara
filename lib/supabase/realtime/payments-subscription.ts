import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export const subscribeToPayments = (
  client: SupabaseClient,
  onUpdate: () => void
) => {
  const channel = client.channel('admin-revenue-stream')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'payments' },
      (payload) => {
        if (payload.new.status === 'completed') {
            // Optional: Play sound or show visual cue
            toast.success(`Payment Received: NPR ${payload.new.amount_paid}`, {
                description: `TXN: ${payload.new.transaction_id || 'N/A'}`
            });
            onUpdate();
        }
      }
    )
    .subscribe();

  return channel;
};