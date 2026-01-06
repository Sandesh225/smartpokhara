"use client";

import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { StatusBadge } from "@/components/staff/shared/StatusBadge";
import { PriorityBadge } from "@/components/staff/shared/PriorityBadge";
import { CountdownTimer } from "@/components/staff/shared/CountdownTimer";
import { DistanceIndicator } from "@/components/staff/shared/DistanceIndicator";
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
          className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 active:scale-[0.99] transition-all hover:border-blue-300 hover:shadow-md relative"
        >
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                  item.type === 'complaint' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                )}>
                  {item.type === 'complaint' ? 'CMP' : 'TSK'}
                </span>
                <span className="text-xs font-mono text-gray-500">{item.tracking_code}</span>
             </div>
             <StatusBadge status={item.status} />
          </div>

          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
          
          <div className="flex items-center gap-2 mb-4">
             <PriorityBadge priority={item.priority} />
             <span className="text-xs text-gray-400">•</span>
             <span className="text-xs text-gray-500 truncate max-w-[150px]">{item.category}</span>
          </div>

          {showAssignee && item.assignee && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
               <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                 {item.assignee.avatar ? (
                    <img src={item.assignee.avatar} alt="" className="w-full h-full object-cover" />
                 ) : (
                    <User className="w-3 h-3 text-gray-500" />
                 )}
               </div>
               <span className="text-xs font-medium text-gray-700">{item.assignee.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
             <div className="space-y-1">
               <DistanceIndicator address={item.location} distanceMeters={null} />
               <CountdownTimer deadline={item.due_at} />
             </div>
             
             <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <ArrowRight className="w-4 h-4" />
             </div>
          </div>
        </Link>
      ))}
    </div>
  );
}