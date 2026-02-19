"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  User,
  ArrowRight,
} from "lucide-react";
import { TaskSummary, DashboardTask } from "@/features/admin-dashboard/types";
import { cn } from "@/lib/utils";

export function TasksOverview({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <Card className="stone-card border-none  transition-all duration-300 hover:elevation-3">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 shadow-sm">
              <CheckSquare className="w-5 h-5 text-primary" />
            </div>
            Operations Feed
          </CardTitle>
          <Badge className="glass text-[10px] font-mono font-bold border-primary/10 text-primary">
            {tasks.length} ACTIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {" "}
        {/* Flush list for admin density */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
            <CheckSquare className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">
              Clear queue. No pending tasks.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "group relative flex items-center justify-between p-4 transition-all duration-200 cursor-pointer",
                  "hover:bg-muted/30",
                  task.is_overdue && "bg-destructive/[0.02]"
                )}
              >
                {/* Priority Indicator Line */}
                <div
                  className={cn(
                    "absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all",
                    task.priority === "high"
                      ? "bg-destructive"
                      : task.priority === "medium"
                      ? "bg-[rgb(var(--warning-amber))]"
                      : "bg-primary"
                  )}
                />

                <div className="flex items-start gap-4 overflow-hidden pl-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate max-w-[180px] lg:max-w-[240px]">
                        {task.title}
                      </p>
                      {task.is_overdue && (
                        <AlertCircle className="w-3.5 h-3.5 text-destructive animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-muted-foreground font-medium">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </span>
                      <span className="text-border">|</span>
                      <span
                        className={cn(
                          "flex items-center gap-1 font-mono font-bold uppercase tracking-tighter",
                          task.is_overdue
                            ? "text-destructive"
                            : "text-muted-foreground/70"
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border",
                      task.is_overdue
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-primary/5 text-primary border-primary/10"
                    )}
                  >
                    {task.status.replace("_", " ")}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/0 -translate-x-2 group-hover:text-primary group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Admin Quick Link */}
      <div className="p-3 border-t border-border/50 bg-muted/20">
        <button className="w-full py-2 text-[11px] font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">
          View Full Task Management Board
        </button>
      </div>
    </Card>
  );
}
