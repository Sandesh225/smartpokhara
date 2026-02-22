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
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
        <h3 className="text-xs font-black text-foreground flex items-center gap-2 uppercase tracking-widest">
          <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />
          Upcoming Tasks
        </h3>
        <Link href="/staff/queue" className="text-xs font-black text-primary hover:underline uppercase tracking-tighter">
          View All
        </Link>
      </div>
      
      <div className="divide-y divide-border flex-1">
        {tasks.length === 0 ? (
           <div className="p-8 text-center text-xs font-bold text-muted-foreground/40 uppercase tracking-widest italic">No upcoming tasks found.</div>
        ) : (
           tasks.map(task => (
             <Link 
               key={task.id} 
               href={`/staff/queue/${task.id}`} 
               className="block p-4 hover:bg-muted/30 transition-all group relative active:scale-[0.98]"
             >
               <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                    {task.title}
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
               </div>
               <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-widest">
                 <Calendar className="w-2.5 h-2.5 text-info-blue" />
                 <span>Due: {format(new Date(task.due_at), "MMM d, h:mm a")}</span>
               </div>
             </Link>
           ))
        )}
      </div>
    </div>
  );
}