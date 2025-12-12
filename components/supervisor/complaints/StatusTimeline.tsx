import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  new_status: string;
  old_status: string | null;
  created_at: string;
  note: string;
  changed_by: string; // ID or logic to get name
}

interface StatusTimelineProps {
  history: TimelineEvent[];
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  // Sort history newest first
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Activity Timeline</h3>
      </div>
      <div className="p-6">
        <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
          {sortedHistory.length === 0 ? (
            <p className="text-sm text-gray-500 italic pl-4">No activity recorded yet.</p>
          ) : (
            sortedHistory.map((event, idx) => (
              <div key={event.id} className="relative pl-4">
                {/* Connector Dot */}
                <div
                  className={cn(
                    "absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-white",
                    idx === 0 ? "border-blue-600" : "border-gray-300"
                  )}
                >
                  {idx === 0 && (
                    <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Status changed to <span className="capitalize text-blue-700">{event.new_status.replace('_', ' ')}</span>
                    </p>
                    {event.note && (
                      <p className="text-sm text-gray-500 mt-1">{event.note}</p>
                    )}
                  </div>
                  <time className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {format(new Date(event.created_at), "MMM d, h:mm a")}
                  </time>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}