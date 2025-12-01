import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComplaintListItem } from "@/lib/types/complaints";

type ComplaintStatus = ComplaintListItem["status"];

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  ComplaintStatus,
  {
    label: string;
    className: string;
  }
> = {
  draft: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  submitted: {
    label: "Submitted",
    className:
      "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
  },
  received: {
    label: "Received",
    className:
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
  },
  assigned: {
    label: "Assigned",
    className:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  resolved: {
    label: "Resolved",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  closed: {
    label: "Closed",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
  },
  escalated: {
    label: "Escalated",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

const sizeClasses = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function ComplaintStatusBadge({
  status,
  size = "md",
}: ComplaintStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-slate-100 text-slate-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn(sizeClasses[size], config.className, "font-medium border")}
    >
      {config.label}
    </Badge>
  );
}
