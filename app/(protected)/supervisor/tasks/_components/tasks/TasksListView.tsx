"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, Edit2, CheckSquare } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";

import { ProjectTask } from "@/features/tasks/types";

export function TasksListView({ tasks }: { tasks: ProjectTask[] }) {
  if (tasks.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No tasks found matching your criteria.</div>;
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Task Info</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Assigned To</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Due Date</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{task.title}</span>
                    <span className="text-xs text-muted-foreground font-mono mt-0.5">{task.tracking_code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 capitalize text-muted-foreground">
                  {task.task_type.replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {task.assignee?.full_name || "Unassigned"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <StatusBadge status={task.status} variant="task" />
                     <PriorityIndicator priority={task.priority} size="sm" showLabel={false} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <SLACountdown deadline={task.due_date} status={task.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/supervisor/tasks/${task.id}`} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}