"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Complaint } from "@/features/complaints";
import { PortalMode, ComplaintActionType } from "@/types/complaints-ui";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, Building2, MapPin, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ComplaintActionsMenu } from "./ComplaintActionsMenu";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- SUB-COMPONENTS FOR CELLS ---

const StatusCell = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    received: "bg-muted text-foreground border-border",
    assigned: "bg-info-blue/10 text-info-blue border-info-blue/20",
    in_progress: "bg-secondary/10 text-secondary border-secondary/20",
    resolved: "bg-success-green/10 text-success-green border-success-green/20",
    closed: "bg-muted text-muted-foreground border-border",
    rejected: "bg-error-red/10 text-error-red border-error-red/20",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-black uppercase tracking-wider border",
        config[status] || config.received
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
    urgent: "text-error-red",
  };

  const isUrgent = ["high", "critical", "urgent"].includes(priority);

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full ring-2 ring-background",
          isUrgent ? "bg-error-red animate-pulse" : "bg-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-wider",
          config[priority] || config.medium
        )}
      >
        {priority}
      </span>
    </div>
  );
};

// --- COLUMN DEFINITIONS ---

export const getComplaintColumns = (
  portalMode: PortalMode,
  onAction?: (action: ComplaintActionType, complaint: Complaint) => void
): ColumnDef<Complaint>[] => {
  
  const columns: ColumnDef<Complaint>[] = [];

  // 1. SELECTOR (Admin & Supervisor only)
  if (portalMode === "ADMIN" || portalMode === "SUPERVISOR") {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="rounded-md"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="rounded-md"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  // 2. TRACKING ID
  columns.push({
    accessorKey: "tracking_code",
    header: "Tracking ID",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 group/copy">
        <span className="font-mono text-xs font-black text-primary hover:text-primary/80 cursor-pointer transition-colors px-2.5 py-1 bg-primary/5 rounded-lg border border-primary/10">
          #{row.original.tracking_code}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(row.original.tracking_code);
            toast.success("ID Copied");
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  });

  // 3. TITLE / SUMMARY
  columns.push({
    accessorKey: "title",
    header: "Complaint Summary",
    cell: ({ row }) => (
      <div className="max-w-[400px] flex flex-col gap-1.5 py-1">
        <span className="font-black text-foreground uppercase tracking-tight text-sm leading-tight group-hover:text-primary transition-colors">
          {row.original.title}
        </span>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
          {row.original.ward && (
             <span className="flex items-center gap-1">
               <MapPin className="h-3 w-3" /> {row.original.ward.ward_number}
             </span>
          )}
          {row.original.category && (
            <>
              <span className="text-border/40">•</span>
              <span className="flex items-center gap-1 truncate max-w-[120px]">
                <Building2 className="h-3 w-3" /> {row.original.category.name}
              </span>
            </>
          )}
        </div>
      </div>
    ),
  });

  // 4. STATUS
  columns.push({
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  });

  // 5. PRIORITY & SLA
  columns.push({
    accessorKey: "priority",
    id: "priority_sla",
    header: "Priority / SLA",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1.5">
        <PriorityCell priority={row.original.priority} />
        {row.original.sla_due_at && (
          <div className="flex items-center gap-1 text-xs font-medium whitespace-nowrap">
            <Clock className="w-3 h-3 text-muted-foreground" />
             <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(row.original.sla_due_at), { addSuffix: true })}
             </span>
          </div>
        )}
      </div>
    ),
  });

  // 6. REPORTER (Admin & Supervisor Only)
  if (portalMode === "ADMIN" || portalMode === "SUPERVISOR") {
    columns.push({
      header: "Reporter",
      accessorFn: (row) => row.citizen?.profile?.full_name || (row.citizen as any)?.full_name || row.author?.full_name || "Anonymous",
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-foreground truncate max-w-[120px] block">
          {getValue() as string}
        </span>
      ),
    });
  }

  // 7. ACTIONS
  columns.push({
    id: "actions",
    cell: ({ row }) => (
      <ComplaintActionsMenu 
        complaint={row.original} 
        portalMode={portalMode}
        onAction={onAction}
      />
    ),
  });

  return columns;
};
