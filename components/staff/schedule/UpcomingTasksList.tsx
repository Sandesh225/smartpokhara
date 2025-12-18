import Link from "next/link";
import { format } from "date-fns";
import { Calendar, ArrowRight } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  due_at: string;
  priority: string;
}

export function UpcomingTasksList({ tasks }: { tasks: TaskItem[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900">Upcoming Tasks</h3>
        <Link href="/staff/queue" className="text-xs text-blue-600 hover:underline">View Queue</Link>
      </div>
      
      <div className="divide-y divide-gray-100">
        {tasks.map(task => (
          <Link key={task.id} href={`/staff/queue/${task.id}`} className="block p-3 hover:bg-gray-50 transition-colors group">
            <div className="flex justify-between items-start mb-1">
               <span className="text-xs font-semibold text-gray-900 line-clamp-1">{task.title}</span>
               <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500" />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.due_at), "MMM d, h:mm a")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}