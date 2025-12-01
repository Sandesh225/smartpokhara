import type React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";
import type { ComplaintListItem } from "@/lib/types/complaints";

type ComplaintPriority = ComplaintListItem["priority"];

interface ComplaintPriorityBadgeProps {
  priority: ComplaintPriority;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
}

const priorityConfig: Record<
  ComplaintPriority,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  low: {
    label: "Low",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    icon: <ArrowDown className="h-3 w-3" />,
  },
  medium: {
    label: "Medium",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    icon: <Minus className="h-3 w-3" />,
  },
  high: {
    label: "High",
    className:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
    icon: <ArrowUp className="h-3 w-3" />,
  },
  critical: {
    label: "Critical",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

const sizeClasses = {
  xs: "text-[9px] px-1.5 py-0.5 gap-0.5",
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1",
  lg: "text-sm px-3 py-1.5 gap-1.5",
};

export function ComplaintPriorityBadge({
  priority,
  size = "md",
  showLabel = true,
}: ComplaintPriorityBadgeProps) {
  const config = priorityConfig[priority] || {
    label: priority,
    className: "bg-slate-100 text-slate-700",
    icon: null,
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        config.className,
        "font-semibold border inline-flex items-center"
      )}
    >
      {config.icon}
      {showLabel && config.label}
    </Badge>
  );
}
