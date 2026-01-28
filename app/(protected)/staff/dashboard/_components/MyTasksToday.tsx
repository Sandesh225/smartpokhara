"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/staff/shared/StatusBadge";
import { PriorityBadge } from "@/components/staff/shared/PriorityBadge";
import { getTimeRemaining } from "@/lib/utils/time-helpers";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

export function MyTasksToday({ tasks }: { tasks: any[] }) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("my-tasks-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_work_assignments" }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (localTasks.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2 bg-gradient-to-br from-card to-muted/30 dark:from-card dark:to-muted/10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 ring-8 ring-green-50/50 dark:ring-green-500/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          No tasks assigned for today yet. Check back later or view your schedule.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 dark:from-primary dark:to-primary/90 shadow-lg shadow-primary/25 dark:shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Today's Queue</h3>
            <p className="text-xs text-muted-foreground font-medium">
              {localTasks.length} active {localTasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
          <span>Live updates</span>
        </div>
      </div>

      <div className="grid gap-4">
        {localTasks.map((task) => (
          <a
            href={`/staff/queue/${task.id}`}
            key={task.id}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
          >
            <Card className="p-5 transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20 hover:-translate-y-0.5 hover:border-primary/50 dark:hover:border-primary/30 active:scale-[0.99]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center text-[11px] font-mono font-medium bg-muted dark:bg-muted/50 px-2.5 py-1 rounded-md text-foreground border border-border">
                    {task.tracking_code}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
                <StatusBadge status={task.status} />
              </div>

              <h4 className="font-semibold text-foreground mb-3 line-clamp-2 text-base leading-snug group-hover:text-primary dark:group-hover:text-primary/90 transition-colors">
                {task.title}
              </h4>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className={`rounded-full p-1 transition-colors ${
                      task.due_at && new Date(task.due_at) < new Date() 
                        ? "bg-red-100 dark:bg-red-500/20" 
                        : "bg-muted dark:bg-muted/50"
                    }`}>
                      <Clock className={`h-3.5 w-3.5 ${
                        task.due_at && new Date(task.due_at) < new Date() 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <span className={`font-medium ${
                      task.due_at && new Date(task.due_at) < new Date() 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-foreground"
                    }`}>
                      {getTimeRemaining(task.due_at)}
                    </span>
                  </div>
                  {task.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="rounded-full p-1 bg-muted dark:bg-muted/50">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate max-w-[120px] font-medium text-foreground">{task.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-primary dark:text-primary/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">View</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}