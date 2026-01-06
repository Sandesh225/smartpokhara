import { notFound, redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorTasksQueries } from "@/lib/supabase/queries/supervisor-tasks";
import { TaskDetailHeader } from "@/app/(protected)/supervisor/tasks/_components/tasks/TaskDetailHeader";
import { TaskInformation } from "@/app/(protected)/supervisor/tasks/_components/tasks/TaskInformation";
import { TaskChecklist } from "@/app/(protected)/supervisor/tasks/_components/tasks/TaskChecklist";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { taskId } = await params;
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const task = await supervisorTasksQueries.getTaskById(supabase, taskId);

  if (!task) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <TaskDetailHeader task={task} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskInformation task={task} />
          </div>
          <div className="space-y-6">
            <TaskChecklist items={task.checklist_items || []} />
          </div>
        </div>
      </div>
    </div>
  );
}