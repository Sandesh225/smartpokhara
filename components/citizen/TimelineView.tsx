"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";

interface TimelineEvent {
  event_type: string;
  title: string;
  description: string;
  created_at: string;
  actor_name: string;
}

export default function TimelineView({ complaintId }: { complaintId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTimeline() {
      const { data } = await supabase.rpc("rpc_get_complaint_timeline", {
        p_complaint_id: complaintId
      });
      if (data) setEvents(data);
    }
    fetchTimeline();
  }, [complaintId, supabase]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'created': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'status_change': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'work_log': return <AlertCircle className="w-5 h-5 text-indigo-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center ring-8 ring-white">
                  {getIcon(event.event_type)}
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-1">by {event.actor_name}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-gray-500">
                    {format(new Date(event.created_at), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}