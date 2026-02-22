"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// Mock Type for now, similar to page.tsx
export type Task = any; 

const StatusCell = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    open: "bg-muted text-foreground border-border",
    in_progress: "bg-secondary/10 text-secondary border-secondary/20",
    completed: "bg-success-green/10 text-success-green border-success-green/20",
    on_hold: "bg-warning-amber/10 text-warning-amber border-warning-amber/20",
    cancelled: "bg-error-red/10 text-error-red border-error-red/20",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-black uppercase tracking-wider border",
        config[status] || config.open
      )}
    >
      {status?.replace("_", " ")}
    </Badge>
  );
};

const PriorityCell = ({ priority }: { priority: string }) => {
   const config: Record<string, string> = {
    low: "text-muted-foreground",
    medium: "text-info-blue",
    high: "text-warning-amber",
    critical: "text-error-red",
  };

  const isCritical = priority === "critical" || priority === "high";

  return (
    <div className="flex items-center gap-1.5">
       <div
        className={cn(
          "w-1.5 h-1.5 rounded-full ring-2 ring-background",
          isCritical ? "bg-error-red animate-pulse" : "bg-muted-foreground"
        )}
      />
      <span className={cn(
          "text-xs font-bold uppercase tracking-wider",
          config[priority] || config.medium
      )}>
        {priority}
      </span>
    </div>
  );
};

export const getTaskColumns = (): ColumnDef<Task>[] => [
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => (
      <div className="max-w-[300px] flex flex-col gap-1">
        <span className="font-bold text-foreground truncate text-sm leading-tight">
          {row.original.title}
        </span>
         <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
           {row.original.ward && (
             <span className="flex items-center gap-1 font-medium">
                <MapPin className="h-3 w-3" /> Ward {row.original.ward.ward_number}
             </span>
           )}
           {row.original.related_complaint && (
             <>
                <span className="text-border mx-1">•</span>
                <span className="truncate">
                    Ref: #{row.original.related_complaint.tracking_code}
                </span>
             </>
           )}
         </div>
      </div>
    ),
  },
  {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
      accessorKey: "priority",
      header: "Priority",
       cell: ({ row }) => <PriorityCell priority={row.original.priority} />,
  },
  {
      accessorKey: "due_date",
      header: "Due",
      cell: ({ row }) => row.original.due_date ? (
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground whitespace-nowrap">
             <Clock className="w-3 h-3" />
             {formatDistanceToNow(new Date(row.original.due_date), { addSuffix: true })}
          </div>
      ) : <span className="text-muted-foreground text-xs">-</span>
  },
];
