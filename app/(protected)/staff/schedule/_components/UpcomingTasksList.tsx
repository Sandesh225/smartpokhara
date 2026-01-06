"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  due_at: string;
  priority: string;
}

export function UpcomingTasksList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="stone-card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Upcoming Tasks
        </h3>
        <Link href="/staff/queue" className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wide">
          View All
        </Link>
      </div>
      
      <div className="divide-y divide-gray-100 flex-1">
        {tasks.length === 0 ? (
           <div className="p-6 text-center text-xs text-gray-400">No upcoming tasks found.</div>
        ) : (
           tasks.map(task => (
             <Link 
               key={task.id} 
               href={`/staff/queue/${task.id}`} 
               className="block p-4 hover:bg-gray-50 transition-colors group relative"
             >
               <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                    {task.title}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
               </div>
               <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                 <Calendar className="w-3 h-3 text-gray-400" />
                 <span>Due: {format(new Date(task.due_at), "MMM d, h:mm a")}</span>
               </div>
             </Link>
           ))
        )}
      </div>
    </div>
  );
}