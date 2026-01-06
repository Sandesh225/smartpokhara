"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { format } from "date-fns";

const COLUMNS = [
  { id: 'not_started', label: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50' },
  { id: 'completed', label: 'Completed', color: 'bg-green-50' }
];

export function TasksKanbanBoard({ tasks }: { tasks: any[] }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-14rem)]">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div key={col.id} className="w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-xl border border-gray-200">
            <div className={`p-3 rounded-t-xl border-b border-gray-200 flex justify-between items-center ${col.color}`}>
              <h3 className="font-semibold text-sm text-gray-900">{col.label}</h3>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {columnTasks.map(task => (
                <Link 
                  key={task.id} 
                  href={`/supervisor/tasks/${task.id}`}
                  className="block bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-gray-400">{task.tracking_code}</span>
                    <PriorityIndicator priority={task.priority} size="sm" showLabel={false} />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{task.title}</h4>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.primary_assigned?.full_name}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-50">
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