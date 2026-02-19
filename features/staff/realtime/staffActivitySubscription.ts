import { SupabaseClient } from "@supabase/supabase-js";

export const subscribeToStaffActivity = (
  client: SupabaseClient,
  onUpdate: () => void
) => {
  const channel = client.channel('admin-staff-activity')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'staff_profiles' },
      (payload) => {
        if (
             payload.new.availability_status !== payload.old.availability_status ||
             payload.new.current_workload !== payload.old.current_workload
        ) {
            onUpdate();
        }
      }
    )
    .on(
       'postgres_changes',
       { event: 'INSERT', schema: 'public', table: 'staff_attendance_logs' },
       () => onUpdate() 
    )
    .subscribe();

  return channel;
};
