"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
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
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-4">
        <h3 className="text-base font-semibold text-foreground">Active Assignments</h3>
        <div className="flex bg-muted rounded-lg p-1">
          {['all', 'complaint', 'task'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md capitalize transition-all",
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}s
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No active assignments found.</div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                  item.type === 'complaint' ? "bg-info-blue/10 text-info-blue" : "bg-primary/10 text-primary"
                )}>
                  {item.type === 'complaint' ? 'CMP' : 'TSK'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{item.label}</span>
                    <PriorityIndicator priority={item.priority} size="sm" showLabel={false} />
                  </div>
                  <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
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
                  className="text-xs font-medium text-info-blue hover:text-info-blue/80"
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