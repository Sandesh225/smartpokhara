import { Check, Clock, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Placeholder data logic - in real app, fetch from audit logs or updates table filtered by staff_id
const MOCK_ACTIVITY = [
  { id: 1, type: "resolution", title: "Resolved Complaint #PKR-005", time: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 2, type: "update", title: "Updated status on Task #TSK-002", time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 3, type: "checkin", title: "Checked in at Ward 5", time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
];

export function ActivityTimeline() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-xs p-6">
      <h3 className="text-base font-semibold text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {MOCK_ACTIVITY.map((item, idx) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Connector Line */}
            {idx !== MOCK_ACTIVITY.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border -mb-6" />
            )}
            
            <div className="h-8 w-8 rounded-full bg-muted/50 border border-border flex items-center justify-center shrink-0 z-10">
              {item.type === 'resolution' ? <Check className="h-4 w-4 text-success-green" /> :
               item.type === 'update' ? <Edit2 className="h-4 w-4 text-info-blue" /> :
               <Clock className="h-4 w-4 text-muted-foreground" />}
            </div>
            
            <div className="pt-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}