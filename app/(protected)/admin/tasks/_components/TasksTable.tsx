import { AdminTask } from "@/types/admin-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface TasksTableProps {
  data: AdminTask[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function TasksTable({
  data,
  onStatusChange,
  onDelete,
}: TasksTableProps) {
  if (data.length === 0) {
    return (
      <div className="stone-card border-2 border-dashed py-12 md:py-16 text-center">
        <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
          No Tasks Found
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">
          Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block stone-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Assignee
                </th>
                <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Deadline
                </th>
                <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((task) => {
                const isOverdue =
                  isPast(new Date(task.due_date)) &&
                  task.status !== "completed";
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-foreground">
                        {task.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[250px] mt-1">
                        {task.description}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        {task.tracking_code}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-border">
                          <AvatarImage src={task.assignee?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {task.assignee?.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[140px] text-sm font-medium">
                          {task.assignee?.full_name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <BadgePriority priority={task.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={cn(
                          "font-semibold text-sm",
                          isOverdue ? "text-error-red" : "text-foreground"
                        )}
                      >
                        {format(new Date(task.due_date), "MMM d, yyyy")}
                      </div>
                      {isOverdue && (
                        <div className="text-xs text-error-red font-bold uppercase mt-0.5">
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Select
                        defaultValue={task.status}
                        onValueChange={(val) => onStatusChange(task.id, val)}
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">
                            Not Started
                          </SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/admin/tasks/${task.id}`}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-error-red" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="lg:hidden space-y-3">
        {data.map((task) => {
          const isOverdue =
            isPast(new Date(task.due_date)) && task.status !== "completed";
          return (
            <div key={task.id} className="stone-card p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/tasks/${task.id}`}
                    className="font-bold text-sm text-foreground hover:text-primary line-clamp-2"
                  >
                    {task.title}
                  </Link>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {task.tracking_code}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4 text-error-red" />
                </Button>
              </div>

              {/* Assignee & Priority */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-border">
                    <AvatarImage src={task.assignee?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {task.assignee?.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                    {task.assignee?.full_name || "Unassigned"}
                  </span>
                </div>
                <BadgePriority priority={task.priority} />
              </div>

              {/* Status & Deadline */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">
                    Deadline
                  </p>
                  <p
                    className={cn(
                      "text-xs font-bold",
                      isOverdue ? "text-error-red" : "text-foreground"
                    )}
                  >
                    {format(new Date(task.due_date), "MMM d, yyyy")}
                  </p>
                </div>
                <Select
                  defaultValue={task.status}
                  onValueChange={(val) => onStatusChange(task.id, val)}
                >
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function BadgePriority({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    critical: "bg-error-red/10 text-error-red border-error-red/30",
    high: "bg-warning-amber/10 text-warning-amber border-warning-amber/30",
    medium: "bg-info-blue/10 text-info-blue border-info-blue/30",
    low: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border",
        config[priority] || config.medium
      )}
    >
      {priority}
    </span>
  );
}