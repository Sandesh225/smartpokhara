// ═══════════════════════════════════════════════════════════
// TASK DETAIL PAGE
// ═══════════════════════════════════════════════════════════

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { adminTaskQueries } from "@/lib/supabase/queries/admin/tasks";
import { TaskStatusUpdater } from "../_components/TaskStatusUpdater";
import { TaskComments } from "../_components/TaskComments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTask = async () => {
    try {
      const data = await adminTaskQueries.getTaskById(supabase, id as string);
      setTask(data);
    } catch (error) {
      toast.error("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    try {
      await adminTaskQueries.updateTask(supabase, task.id, {
        status: status as any,
      });
      toast.success("Status updated successfully");
      fetchTask();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleAddComment = async (text: string) => {
    try {
      await adminTaskQueries.addComment(supabase, task.id, text);
      fetchTask();
    } catch (e) {
      toast.error("Failed to add comment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-error-red mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Task Not Found</h2>
          <Button asChild variant="outline">
            <Link href="/admin/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* BACK BUTTON */}
      <Button variant="ghost" asChild size="sm">
        <Link href="/admin/tasks">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Board</span>
        </Link>
      </Button>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT COLUMN - Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* TASK DETAILS CARD */}
          <div className="stone-card p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {task.title}
              </h1>
              <span className="font-mono text-xs text-muted-foreground self-start sm:self-auto">
                {task.tracking_code}
              </span>
            </div>

            <p className="text-sm md:text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* DISCUSSION */}
          <div className="stone-card p-4 md:p-6">
            <h3 className="font-bold text-base md:text-lg mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Discussion
            </h3>
            <TaskComments
              comments={task.comments || []}
              onAddComment={handleAddComment}
            />
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* STATUS UPDATER */}
          <TaskStatusUpdater
            status={task.status}
            onUpdate={handleUpdateStatus}
          />

          {/* TASK METADATA */}
          <div className="stone-card p-4 md:p-6 space-y-4">
            <h3 className="font-bold text-sm md:text-base mb-3">
              Task Details
            </h3>

            {/* Assignee */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium">Assignee</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm md:text-base text-foreground">
                  {task.assignee?.full_name || "Unassigned"}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  asChild
                >
                  <Link href={`/admin/tasks/${task.id}/assign`}>Reassign</Link>
                </Button>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="font-medium">Priority</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {task.priority}
              </Badge>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Due Date</span>
              </div>
              <p className="font-semibold text-sm md:text-base text-foreground">
                {format(new Date(task.due_date), "PPP")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
