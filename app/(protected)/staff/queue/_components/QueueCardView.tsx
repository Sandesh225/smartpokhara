"use client";

import Link from "next/link";
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
  assignee?: {
    name: string;
    avatar?: string;
  } | null;
}

interface QueueCardViewProps {
  items: QueueItem[];
  showAssignee?: boolean;
}

export function QueueCardView({ items, showAssignee = false }: QueueCardViewProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
      {items.map((item) => (
        <Link 
          key={item.id} 
          href={`/staff/queue/${item.id}`}
          className="block bg-card rounded-xl border border-border shadow-xs p-4 active:scale-[0.99] transition-all hover:border-primary/50 hover:shadow-md relative"
        >
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                  item.type === 'complaint' ? "bg-primary/10 text-primary border border-primary/20" : "bg-info-blue/10 text-info-blue border border-info-blue/20"
                )}>
                  {item.type === 'complaint' ? 'CMP' : 'TSK'}
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">#{item.tracking_code.split('-').pop()}</span>
             </div>
             <StatusBadge status={item.status} />
          </div>

          <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-1">{item.title}</h3>
          
          <div className="flex items-center gap-2 mb-4">
             <PriorityIndicator priority={item.priority} size="sm" />
             <span className="text-xs text-muted-foreground/30">•</span>
             <span className="text-xs text-muted-foreground truncate max-w-[150px] font-medium">{item.category}</span>
          </div>

          {showAssignee && item.assignee && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg border border-border">
               <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                 {item.assignee.avatar ? (
                    <img src={item.assignee.avatar} alt="" className="w-full h-full object-cover" />
                 ) : (
                    <User className="w-3 h-3 text-muted-foreground" />
                 )}
               </div>
               <span className="text-xs font-bold text-foreground">{item.assignee.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
             <div className="space-y-1">
               <DistanceIndicator address={item.location} distanceMeters={null} />
               <CountdownTimer deadline={item.due_at} />
             </div>
             
             <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <ArrowRight className="w-4 h-4" />
             </div>
          </div>
        </Link>
      ))}
    </div>
  );
}