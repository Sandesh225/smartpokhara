import { MapPin, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";

export function TaskInformation({ task }: { task: any }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">{task.title}</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-info-blue/10 flex items-center justify-center text-info-blue">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold">Assigned To</p>
              <p className="text-sm font-medium text-foreground">{task.assignee?.name || "Unassigned"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold">Due Date</p>
              <p className="text-sm font-medium text-foreground">{format(new Date(task.due_date), "PP p")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning-amber/10 flex items-center justify-center text-warning-amber">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold">Time Remaining</p>
              <div className="mt-1">
                 <SLACountdown deadline={task.due_date} status={task.status} />
              </div>
            </div>
          </div>
          
          {/* Location Mock */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold">Location</p>
              <p className="text-sm font-medium text-foreground">Ward {task.ward?.ward_number || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}