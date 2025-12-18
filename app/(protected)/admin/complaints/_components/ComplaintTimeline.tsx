import { formatDistanceToNow } from "date-fns";

export function ComplaintTimeline({ timeline }: { timeline: any[] }) {
  return (
    <div className="bg-white rounded-lg border p-4">
       <h3 className="font-semibold mb-4 text-sm uppercase text-gray-500">Audit Trail</h3>
       <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pl-6 pb-2">
          {timeline.map((event: any) => (
             <div key={event.id} className="relative">
                <div className="absolute -left-[29px] h-3 w-3 bg-blue-500 rounded-full border-2 border-white" />
                <div className="text-sm">
                   <p className="font-medium text-gray-900">
                      {event.note || `Status changed to ${event.new_status}`}
                   </p>
                   <p className="text-xs text-gray-500 mt-1">
                      by {event.actor?.profile?.full_name || 'System'} • {formatDistanceToNow(new Date(event.created_at))} ago
                   </p>
                </div>
             </div>
          ))}
          {timeline.length === 0 && <div className="text-sm text-gray-500">No history available</div>}
       </div>
    </div>
  );
}