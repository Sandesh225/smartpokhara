// components/staff/TaskTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type Task = Database['public']['Tables']['tasks']['Row'] & {
  related_complaint?: { tracking_code: string; title: string };
  assigned_to_user?: { user_profiles: { full_name: string } };
  wards?: { ward_number: number; name: string };
  assigned_department?: { name: string };
};

interface TaskTableProps {
  tasks: Task[];
  onTaskUpdate?: () => void;
}

export function TaskTable({ tasks, onTaskUpdate }: TaskTableProps) {
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdatingTask(taskId);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", taskId);

      if (error) throw error;
      
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingTask(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      on_hold: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Task
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Related To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Department/Ward
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                {task.description && (
                  <div className="text-sm text-gray-500 line-clamp-2">{task.description}</div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {task.related_complaint ? (
                  <Link
                    href={`/staff/complaints/${task.related_complaint_id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {task.related_complaint.tracking_code}
                  </Link>
                ) : (
                  <span className="text-gray-400">Standalone</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {task.assigned_department?.name || task.wards?.name || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {task.assigned_to_user?.user_profiles?.full_name || "Unassigned"}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
              </td>
              <td className="px-6 py-4">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  disabled={updatingTask === task.id}
                  className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${getStatusColor(task.status)}`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="px-6 py-4 text-sm font-medium">
                <Link
                  href={`/staff/tasks/${task.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tasks.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-sm text-gray-500">No tasks found</div>
        </div>
      )}
    </div>
  );
}