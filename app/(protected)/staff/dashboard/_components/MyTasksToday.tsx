"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
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
      <Card className="p-12 text-center border-dashed border-2 bg-muted/30">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-4xl bg-accent/50 ring-8 ring-accent/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">All Caught Up!</h3>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-sm">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Today's Queue</h3>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
              {localTasks.length} active {localTasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-semibold tracking-wide">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Live updates</span>
        </div>
      </div>

      <div className="grid gap-4">
        {localTasks.map((task) => (
          <a
            href={`/staff/queue/${task.id}`}
            key={task.id}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/50 group-active:scale-[0.99] bg-card border-border overflow-hidden relative">
              <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center text-eyebrow bg-muted px-2 py-1 rounded border border-border text-muted-foreground">
                    {task.tracking_code}
                  </span>
                  <PriorityIndicator priority={task.priority} size="sm" />
                </div>
                <StatusBadge status={task.status} />
              </div>

              <h4 className="font-sans font-bold text-foreground mb-4 line-clamp-2 text-base leading-snug group-hover:text-primary transition-colors relative z-10">
                {task.title}
              </h4>

              <div className="flex items-center justify-between pt-4 border-t border-border relative z-10">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className={`rounded p-1 transition-colors ${
                      task.due_at && new Date(task.due_at) < new Date() 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <span className={
                      task.due_at && new Date(task.due_at) < new Date() 
                        ? "text-destructive" 
                        : "text-foreground"
                    }>
                      {getTimeRemaining(task.due_at)}
                    </span>
                  </div>
                  {task.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="rounded p-1 bg-muted">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate max-w-[120px] text-foreground">{task.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider">View</span>
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