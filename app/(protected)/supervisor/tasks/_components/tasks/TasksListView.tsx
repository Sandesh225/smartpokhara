"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, Edit2, CheckSquare } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";

interface Task {
  id: string;
  tracking_code: string;
  title: string;
  task_type: string;
  status: string;
  priority: string;
  due_date: string;
  primary_assigned: { full_name: string } | null;
}

export function TasksListView({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <div className="text-center py-12 text-gray-500">No tasks found matching your criteria.</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Task Info</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Assigned To</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Due Date</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{task.title}</span>
                    <span className="text-xs text-gray-500 font-mono mt-0.5">{task.tracking_code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 capitalize text-gray-600">
                  {task.task_type.replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {task.primary_assigned?.full_name || "Unassigned"}
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
                    <Link href={`/supervisor/tasks/${task.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
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