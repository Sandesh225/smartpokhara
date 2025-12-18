import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type AnyRow = Record<string, any>;

type UpdatePayload<T extends AnyRow = AnyRow> = RealtimePostgresChangesPayload<T> & {
  eventType: "UPDATE";
  new: T;
  old: T;
};

type InsertPayload<T extends AnyRow = AnyRow> = RealtimePostgresChangesPayload<T> & {
  eventType: "INSERT";
  new: T;
};

export const supervisorComplaintsSubscription = {
  /**
   * Listens for changes to a specific complaint row (UPDATE only).
   */
  subscribeToComplaint(
    complaintId: string,
    onUpdate: (newRecord: AnyRow, payload: UpdatePayload) => void
  ): RealtimeChannel {
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
        (payload) => {
          const p = payload as UpdatePayload;
          onUpdate(p.new, p);
        }
      )
      .subscribe();
  },

  /**
   * Listens for new timeline/history rows (INSERT).
   * NOTE: adjust table name if yours differs (e.g. complaint_status_history).
   */
  subscribeToComplaintUpdates(
    complaintId: string,
    onInsert: (newRecord: AnyRow, payload: InsertPayload) => void
  ): RealtimeChannel {
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
        (payload) => {
          const p = payload as InsertPayload;
          onInsert(p.new, p);
        }
      )
      .subscribe();
  },

  /**
   * Listens for new internal notes (INSERT).
   */
  subscribeToInternalNotes(
    complaintId: string,
    onInsert: (newRecord: AnyRow, payload: InsertPayload) => void
  ): RealtimeChannel {
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
        (payload) => {
          const p = payload as InsertPayload;
          onInsert(p.new, p);
        }
      )
      .subscribe();
  },

  /**
   * Listens for NEW unassigned complaints (assigned_staff_id IS NULL).
   * Also listens for UPDATE and removes an item once it becomes assigned.
   */
  subscribeToUnassignedQueue(
    onInsert: (newRow: AnyRow) => void,
    onRemove?: (complaintId: string) => void
  ): RealtimeChannel {
    return supabase
      .channel("unassigned-queue-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaints",
          filter: "assigned_staff_id=is.null",
        },
        (payload) => {
          const p = payload as InsertPayload;
          onInsert(p.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "complaints",
        },
        (payload) => {
          const p = payload as UpdatePayload;

          // Only remove when it transitions from NULL -> NOT NULL
          const wasUnassigned = p.old?.assigned_staff_id == null;
          const isNowAssigned = p.new?.assigned_staff_id != null;

          if (wasUnassigned && isNowAssigned && onRemove) {
            onRemove(p.new.id);
          }
        }
      )
      .subscribe();
  },

  /**
   * Correct unsubscribe (Supabase v2):
   * - removeChannel removes + unsubscribes from server.
   */
  async unsubscribe(channel: RealtimeChannel | null | undefined): Promise<void> {
    if (!channel) return;
    try {
      await supabase.removeChannel(channel);
    } catch (e) {
      console.warn("Failed to remove realtime channel:", e);
    }
  },

  async unsubscribeMany(channels: Array<RealtimeChannel | null | undefined>): Promise<void> {
    await Promise.all(channels.map((ch) => this.unsubscribe(ch)));
  },
};
