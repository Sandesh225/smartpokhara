"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { formatDistanceToNow } from "date-fns";

interface Assignment {
  id: string;
  type: 'complaint' | 'task';
  label: string;
  title: string;
  priority: string;
  status: string;
  deadline: string | null;
}

interface Props {
  assignments: Assignment[];
}

export function CurrentAssignments({ assignments }: Props) {
  const [filter, setFilter] = useState<'all' | 'complaint' | 'task'>('all');

  const filtered = assignments.filter(a => filter === 'all' || a.type === filter);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <h3 className="text-base font-semibold text-gray-900">Active Assignments</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['all', 'complaint', 'task'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md capitalize transition-all",
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {f}s
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No active assignments found.</div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                  item.type === 'complaint' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                )}>
                  {item.type === 'complaint' ? 'CMP' : 'TSK'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{item.label}</span>
                    <PriorityIndicator priority={item.priority} size="sm" showLabel={false} />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {item.deadline && (
                  <div className="hidden sm:block">
                     <SLACountdown deadline={item.deadline} status={item.status} />
                  </div>
                )}
                <StatusBadge status={item.status} variant={item.type === 'complaint' ? 'complaint' : 'task'} />
                <Link 
                  href={item.type === 'complaint' ? `/supervisor/complaints/${item.id}` : `/supervisor/tasks/${item.id}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}