import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorTasksQueries } from "@/lib/supabase/queries/supervisor-tasks";
import { TasksListView } from "@/app/(protected)/supervisor/tasks/_components/tasks/TasksListView";
import { TasksKanbanBoard } from "@/app/(protected)/supervisor/tasks/_components/tasks/TasksKanbanBoard";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TaskDashboard({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const { view = "list" } = await searchParams;
  const supabase = await createClient();
  const tasks = await supervisorTasksQueries.getSupervisorTasks(supabase, user.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-500">Track and manage your team's assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
             <Link href="?view=list" className={`px-3 py-1.5 rounded-md ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>List</Link>
             <Link href="?view=kanban" className={`px-3 py-1.5 rounded-md ${view === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Kanban</Link>
          </div>
          <Link 
            href="/supervisor/tasks/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Create Task
          </Link>
        </div>
      </div>

      {view === 'list' ? (
        <TasksListView tasks={tasks} />
      ) : (
        <TasksKanbanBoard tasks={tasks} />
      )}
    </div>
  );
}