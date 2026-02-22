"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { DistanceIndicator } from "@/components/shared/DistanceIndicator";
import { cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  type: string;
  tracking_code: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  due_at: string;
  location: string;
  distance?: number;
  assignee?: {
    name: string;
    avatar?: string;
  } | null;
}

interface QueueListViewProps {
  items: QueueItem[];
  showAssignee?: boolean;
}

export function QueueListView({ items, showAssignee = false }: QueueListViewProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-widest text-xs font-bold">
            <tr>
              <th className="px-6 py-3 font-semibold">ID / Title</th>
              {showAssignee && <th className="px-6 py-3 font-semibold">Assigned To</th>}
              <th className="px-6 py-3 font-semibold">Location</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Due</th>
              <th className="px-6 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-mono font-bold",
                        item.type === 'complaint' ? "text-primary" : "text-info-blue"
                      )}>
                        {item.tracking_code}
                      </span>
                      <PriorityIndicator priority={item.priority} size="sm" />
                    </div>
                    <span className="font-semibold text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  </div>
                </td>
                
                {showAssignee && (
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border">
                           {item.assignee?.avatar ? (
                             <img src={item.assignee.avatar} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-3 h-3 text-muted-foreground" />
                           )}
                        </div>
                        <span className="text-sm text-foreground font-medium">{item.assignee?.name}</span>
                     </div>
                  </td>
                )}

                <td className="px-6 py-4">
                   <DistanceIndicator address={item.location} distanceMeters={item.distance || null} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium">{format(new Date(item.due_at), "MMM d")}</span>
                    <CountdownTimer deadline={item.due_at} />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/staff/queue/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all active:scale-95"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}