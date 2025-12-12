import { AlertCircle, AlertTriangle, Flag, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type PriorityLevel = "critical" | "emergency" | "high" | "medium" | "low";

interface PriorityIndicatorProps {
  priority: PriorityLevel | string;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  critical: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: AlertCircle,
    label: "Critical",
  },
  emergency: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: AlertCircle,
    label: "Emergency",
  },
  high: {
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    icon: AlertTriangle,
    label: "High",
  },
  medium: {
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    icon: Flag,
    label: "Medium",
  },
  low: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: Info,
    label: "Low",
  },
  default: {
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    icon: Info,
    label: "Unknown",
  },
};

export function PriorityIndicator({
  priority,
  showLabel = true,
  className,
  size = "md",
}: PriorityIndicatorProps) {
  const normalizedPriority = priority?.toLowerCase() || "default";
  const config = PRIORITY_CONFIG[normalizedPriority] || PRIORITY_CONFIG.default;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 font-medium transition-colors",
        config.bg,
        config.color,
        size === "sm" ? "py-0.5 text-[10px]" : "py-1 text-xs",
        className
      )}
      title={`Priority: ${config.label}`}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}