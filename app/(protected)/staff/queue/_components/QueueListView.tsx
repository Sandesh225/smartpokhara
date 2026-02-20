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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-3 font-semibold">ID / Title</th>
              {showAssignee && <th className="px-6 py-3 font-semibold">Assigned To</th>}
              <th className="px-6 py-3 font-semibold">Location</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Due</th>
              <th className="px-6 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-mono font-medium text-gray-500",
                        item.type === 'complaint' ? "text-blue-600" : "text-purple-600"
                      )}>
                        {item.tracking_code}
                      </span>
                      <PriorityIndicator priority={item.priority} size="sm" />
                    </div>
                    <span className="font-medium text-gray-900">{item.title}</span>
                    <span className="text-xs text-gray-500">{item.category}</span>
                  </div>
                </td>
                
                {showAssignee && (
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                           {item.assignee?.avatar ? (
                             <img src={item.assignee.avatar} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-3 h-3 text-gray-400" />
                           )}
                        </div>
                        <span className="text-sm text-gray-700">{item.assignee?.name}</span>
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
                    <span className="text-gray-900">{format(new Date(item.due_at), "MMM d")}</span>
                    <CountdownTimer deadline={item.due_at} />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/staff/queue/${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    View <ArrowRight className="w-3 h-3" />
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