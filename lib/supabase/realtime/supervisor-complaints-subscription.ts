import { supabase } from "@/lib/supabase/client";

/**
 * Real-time Subscription Service for Supervisors
 * Strictly isolates data by Respected Department/Ward.
 */
export const supervisorComplaintsSubscription = {
  /**
   * Listens for unassigned complaints matching the supervisor's jurisdiction.
   * Logic: assigned_staff_id is NULL and status is 'received' or 'assigned'.
   */
  async subscribeToUnassignedQueue(
    onInsert: (newRecord: any) => void,
    onRemove: (complaintId: string) => void
  ) {
    // 1. Fetch current supervisor's scope
    const { data: scope } = await supabase.rpc('get_supervisor_jurisdiction').single();
    
    const respectedDepts = scope?.assigned_departments || [];
    const respectedWards = scope?.assigned_wards || [];
    const isSenior = scope?.is_senior || false;

    // 2. Initialize and return the channel
    const channel = supabase
      .channel('respected-unassigned-queue')
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        (payload) => {
          const { eventType, new: newRec, old: oldRec } = payload;
          const target = newRec || oldRec;

          // JURISDICTION CHECK: Ignore if not in supervisor's scope
          const isRespected = isSenior || 
            respectedDepts.includes(target?.assigned_department_id) || 
            respectedWards.includes(target?.ward_id);

          if (!isRespected) return;

          // CASE A: New complaint or staff removed
          if (
            (eventType === "INSERT" || eventType === "UPDATE") &&
            newRec.assigned_staff_id === null &&
            ['received', 'assigned', 'under_review', 'reopened'].includes(newRec.status)
          ) {
            onInsert(newRec);
          }

          // CASE B: Staff assigned
          if (
            eventType === "UPDATE" &&
            (oldRec.assigned_staff_id === null || oldRec.assigned_staff_id === undefined) &&
            newRec.assigned_staff_id !== null
          ) {
            onRemove(newRec.id);
          }

          // CASE C: Finalized or Deleted
          if (
            eventType === "DELETE" || 
            (eventType === "UPDATE" && ['resolved', 'closed', 'rejected'].includes(newRec.status))
          ) {
            onRemove(target.id);
          }
        }
      )
      .subscribe();

    return channel;
  },

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

  subscribeToComplaintUpdates(complaintId: string, onInsert: (newRecord: any) => void) {
    return supabase
      .channel(`complaint-updates:${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_status_history", 
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => onInsert(payload.new)
      )
      .subscribe();
  },

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

  /**
   * Safer unsubscribe helper
   */
  async unsubscribe(channel: any) {
    const resolvedChannel = await channel; // Handle potential promise
    if (resolvedChannel) {
      await supabase.removeChannel(resolvedChannel);
    }
  }
};