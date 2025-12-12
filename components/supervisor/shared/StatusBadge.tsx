import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowUpCircle,
  PauseCircle,
  HelpCircle,
  Activity,
  Briefcase
} from "lucide-react";

export type StatusVariant = "complaint" | "task" | "staff" | "priority";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  StatusVariant,
  Record<
    string,
    { color: string; icon: any; label?: string; animate?: boolean; tooltip?: string }
  >
> = {
  complaint: {
    received: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertCircle, label: "Received" },
    assigned: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: ArrowUpCircle, label: "Assigned" },
    in_progress: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "In Progress", animate: true },
    resolved: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Resolved" },
    closed: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: CheckCircle2, label: "Closed" },
    escalated: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "Escalated" },
  },
  task: {
    not_started: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock, label: "To Do" },
    in_progress: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Activity, label: "In Progress", animate: true },
    completed: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Completed" },
    cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Cancelled" },
  },
  staff: {
    available: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Available" },
    busy: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Briefcase, label: "Busy" },
    on_leave: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: PauseCircle, label: "On Leave" },
    unavailable: { color: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle, label: "Offline" },
  },
  priority: {
    critical: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
    high: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertCircle },
    medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Activity },
    low: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  },
};

export function StatusBadge({
  status,
  variant = "complaint",
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const key = status?.toLowerCase() || "unknown";
  const config = statusConfig[variant]?.[key] || {
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: HelpCircle,
    label: status,
  };

  const Icon = config.icon;
  const label =
    config.label ||
    (status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "));

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm select-none",
        config.color,
        className
      )}
      title={`Status: ${label}`}
    >
      {config.animate && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {showIcon && !config.animate && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}