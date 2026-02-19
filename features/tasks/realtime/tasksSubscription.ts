import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export const subscribeToTasks = (
  client: SupabaseClient,
  onUpdate: () => void
) => {
  const channel = client.channel('admin-tasks-global')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'supervisor_tasks' },
      (payload) => {
        toast.info("New Task Created", {
            description: `${payload.new.tracking_code}: ${payload.new.title}`
        });
        onUpdate();
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'supervisor_tasks' },
      (payload) => {
        // Only toast on status changes
        if (payload.old.status !== payload.new.status) {
            toast.success(`Task Updated: ${payload.new.tracking_code}`, {
                description: `Status changed to ${payload.new.status}`
            });
        }
        onUpdate();
      }
    )
    .subscribe();

  return channel;
};
