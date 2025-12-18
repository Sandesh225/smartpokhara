"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { adminTaskQueries } from "@/lib/supabase/queries/admin/tasks";
import { TaskStatusUpdater } from "../_components/TaskStatusUpdater";
import { TaskComments } from "../_components/TaskComments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const supabase = createClient();

  const fetchTask = () => {
    adminTaskQueries.getTaskById(supabase, id as string).then(setTask).catch(console.error);
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
     try {
        await adminTaskQueries.updateTask(supabase, task.id, { status: status as any });
        toast.success("Status updated");
        fetchTask();
     } catch (e) { toast.error("Failed"); }
  };

  const handleAddComment = async (text: string) => {
     try {
        await adminTaskQueries.addComment(supabase, task.id, text);
        fetchTask();
     } catch (e) { toast.error("Failed"); }
  };

  if(!task) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
       <Button variant="ghost" asChild><Link href="/admin/tasks"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Board</Link></Button>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl border">
                <div className="flex justify-between">
                   <h1 className="text-2xl font-bold">{task.title}</h1>
                   <span className="font-mono text-gray-400">{task.tracking_code}</span>
                </div>
                <p className="mt-4 text-gray-700">{task.description}</p>
             </div>
             
             <div className="bg-white p-6 rounded-xl border">
                <h3 className="font-bold mb-4">Discussion</h3>
                <TaskComments comments={task.comments} onAddComment={handleAddComment} />
             </div>
          </div>

          <div className="space-y-6">
             <TaskStatusUpdater status={task.status} onUpdate={handleUpdateStatus} />
             
             <div className="bg-white p-6 rounded-xl border space-y-4">
                <h3 className="font-semibold">Details</h3>
                <div className="text-sm">
                   <span className="text-gray-500 block">Assignee</span>
                   <div className="font-medium flex justify-between items-center">
                      {task.assignee?.full_name}
                      <Button variant="link" className="h-auto p-0" asChild>
                         <Link href={`/admin/tasks/${task.id}/assign`}>Reassign</Link>
                      </Button>
                   </div>
                </div>
                <div className="text-sm">
                   <span className="text-gray-500 block">Priority</span>
                   <span className="capitalize">{task.priority}</span>
                </div>
                <div className="text-sm">
                   <span className="text-gray-500 block">Due Date</span>
                   <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}