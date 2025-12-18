import { createClient } from "@/lib/supabase/client";

export const staffAssignmentsSubscription = {
  subscribeToMyQueue(staffId: string, onChange: () => void) {
    const supabase = createClient();
    
    // Subscribe to changes in the assignments table for this staff member
    return supabase
      .channel(`staff-queue:${staffId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "staff_work_assignments",
          filter: `staff_id=eq.${staffId}`,
        },
        () => onChange() // Trigger re-fetch or state update
      )
      .subscribe();
  },

  unsubscribe(channel: any) {
    const supabase = createClient();
    supabase.removeChannel(channel);
  }
};