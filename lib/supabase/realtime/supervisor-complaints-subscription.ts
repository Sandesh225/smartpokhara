import { supabase } from "@/lib/supabase/client";

export const supervisorComplaintsSubscription = {
  /**
   * Listens for changes to a specific complaint (Row Updates).
   */
  subscribeToComplaint(complaintId: string, onUpdate: (newRecord: any) => void) {
    return supabase
      .channel(`complaint-detail:${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "complaints",
          filter: `id=eq.${complaintId}`,
        },
        (payload) => onUpdate(payload.new)
      )
      .subscribe();
  },

  /**
   * Listens for new timeline events (Assignment history, Status changes).
   */
  subscribeToComplaintUpdates(complaintId: string, onInsert: (newRecord: any) => void) {
    return supabase
      .channel(`complaint-updates:${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_updates",
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => onInsert(payload.new)
      )
      .subscribe();
  },

  /**
   * Listens for new internal notes.
   */
  subscribeToInternalNotes(complaintId: string, onInsert: (newRecord: any) => void) {
    return supabase
      .channel(`internal-notes:${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "internal_notes",
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => onInsert(payload.new)
      )
      .subscribe();
  },

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
};