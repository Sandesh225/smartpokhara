import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export const subscribeToComplaints = (
  client: SupabaseClient, 
  onUpdate: () => void
) => {
  const channel = client.channel('admin-global-complaints')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'complaints' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.info(`New Complaint Received`, {
            description: `ID: ${payload.new.tracking_code}`
          });
        }
        onUpdate();
      }
    )
    .subscribe();
    
  return channel;
};
