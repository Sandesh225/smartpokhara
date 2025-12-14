// components/citizen/complaints/ComplaintTimeline.tsx - REAL-TIME VERSION
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle,
  Clock,
  User,
  AlertCircle,
  MapPin,
  Building,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/ui/badge";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  status: string;
  changed_at: string;
  changed_by?: {
    id: string;
    user_profiles: {
      full_name: string;
    };
  };
  note?: string;
}

interface ComplaintTimelineProps {
  complaintId: string;
  initialEvents?: TimelineEvent[];
}

export function ComplaintTimeline({ complaintId, initialEvents = [] }: ComplaintTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const supabase = createClient();

  useEffect(() => {
    fetchTimeline();
    setupRealtimeSubscription();
  }, [complaintId]);

  async function fetchTimeline() {
    const { data, error } = await supabase
      .from("complaint_status_history")
      .select(`
        *,
        changed_by:users(
          id,
          user_profiles(full_name)
        )
      `)
      .eq("complaint_id", complaintId)
      .order("changed_at", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`timeline-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaint_status_history',
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => {
          setEvents(prev => [...prev, payload.new as TimelineEvent]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'assigned':
      case 'accepted':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      received: "Received",
      assigned: "Assigned to Staff",
      accepted: "Accepted by Staff",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      rejected: "Rejected",
      escalated: "Escalated",
    };
    return labels[status] || status.replace('_', ' ');
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      received: "bg-green-100 text-green-800",
      assigned: "bg-blue-100 text-blue-800",
      accepted: "bg-blue-100 text-blue-800",
      in_progress: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      escalated: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No status updates yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {events.map((event, index) => (
          <div key={event.id} className="flex items-start gap-4 pb-6">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-10 w-10 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center">
                  {getStatusIcon(event.status)}
                </div>
                {index < events.length - 1 && (
                  <div className="absolute left-1/2 top-10 h-6 w-0.5 -translate-x-1/2 bg-gray-200" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusLabel(event.status)}
                  </Badge>
                  {event.changed_by?.user_profiles?.full_name && (
                    <span className="text-sm text-gray-600">
                      by {event.changed_by.user_profiles.full_name}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(event.changed_at), "MMM d, yyyy HH:mm")}
                </span>
              </div>

              {event.note && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">{event.note}</p>
                </div>
              )}

              {/* Additional context based on status */}
              {event.status === 'assigned' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>Assigned to relevant department</span>
                </div>
              )}

              {event.status === 'in_progress' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Field inspection scheduled</span>
                </div>
              )}

              {event.status === 'resolved' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Issue resolved successfully</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-sm text-green-600">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span>Live updates enabled</span>
      </div>
    </div>
  );
}