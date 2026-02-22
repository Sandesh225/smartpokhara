"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
import { format } from "date-fns";
import { ProjectTask } from "@/features/tasks/types";

const COLUMNS = [
  { id: 'not_started', label: 'To Do', color: 'bg-muted/50' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-info-blue/10' },
  { id: 'completed', label: 'Completed', color: 'bg-success-green/10' }
];

export function TasksKanbanBoard({ tasks }: { tasks: ProjectTask[] }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-14rem)]">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div key={col.id} className="w-80 shrink-0 flex flex-col bg-muted/20 rounded-xl border border-border">
            <div className={`p-3 rounded-t-xl border-b border-border flex justify-between items-center ${col.color}`}>
              <h3 className="font-semibold text-sm text-foreground">{col.label}</h3>
              <span className="bg-background px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground border border-border">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {columnTasks.map(task => (
                <Link 
                  key={task.id} 
                  href={`/supervisor/tasks/${task.id}`}
                  className="block bg-card p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{task.tracking_code}</span>
                    <PriorityIndicator priority={task.priority} size="sm" showLabel={false} />
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{task.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.assignee?.full_name}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>{format(new Date(task.due_date), "MMM d")}</span>
                    <span className="capitalize">{task.task_type.split('_')[0]}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
}