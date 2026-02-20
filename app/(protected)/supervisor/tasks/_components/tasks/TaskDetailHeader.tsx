"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Trash2, Printer } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

import { ConfirmationDialog } from "@/components/supervisor/shared/ConfirmationDialog";
import { tasksApi } from "@/features/tasks/api";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { PriorityIndicator } from "@/components/shared";

export function TaskDetailHeader({ task }: { task: any }) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleComplete = async () => {
    const supabase = createClient();
    try {
      await tasksApi.updateTask(supabase, task.id, { status: "completed" });
      toast.success("Task marked as complete");
      router.refresh();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    const supabase = createClient();
    try {
      await tasksApi.deleteTask(supabase, task.id);
      toast.success("Task deleted");
      router.push("/supervisor/tasks");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/supervisor/tasks" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{task.tracking_code}</h1>
              <StatusBadge status={task.status} variant="task" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <PriorityIndicator priority={task.priority} size="sm" />
              <span className="text-sm text-gray-500 ml-2">Type: <span className="capitalize">{task.task_type.replace(/_/g, ' ')}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.status !== 'completed' && (
            <button 
              onClick={handleComplete}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
            >
              <CheckCircle className="h-4 w-4" /> Complete
            </button>
          )}
          <button onClick={() => setIsDeleteOpen(true)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}