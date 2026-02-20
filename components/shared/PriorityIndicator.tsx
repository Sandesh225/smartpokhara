import { AlertCircle, AlertTriangle, Flag, Info, Flame, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type PriorityLevel =
  | "critical"
  | "emergency"
  | "urgent"
  | "high"
  | "medium"
  | "low";

interface PriorityIndicatorProps {
  priority: PriorityLevel | string;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const PRIORITY_CONFIG: Record<
  string,
  { color: string; bg: string; icon: any; label: string; glow?: string; iconColor?: string }
> = {
  critical: {
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 border-red-200 dark:bg-red-500/15 dark:border-red-500/30",
    icon: Flame,
    label: "CRITICAL",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)] dark:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
    iconColor: "text-red-600"
  },
  emergency: {
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 border-red-200 dark:bg-red-500/15 dark:border-red-500/30",
    icon: AlertCircle,
    label: "EMERGENCY",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]",
    iconColor: "text-red-600"
  },
  urgent: {
    label: "URGENT",
    icon: AlertCircle,
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    iconColor: "text-red-600"
  },
  high: {
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-500/15",
    icon: ArrowUp,
    label: "HIGH",
    iconColor: "text-orange-600"
  },
  medium: {
    color: "text-blue-700 dark:text-primary-light",
    bg: "bg-blue-50 border-blue-200 dark:bg-primary/10",
    icon: AlertTriangle,
    label: "MEDIUM",
    iconColor: "text-blue-600"
  },
  low: {
    color: "text-slate-600 dark:text-emerald-400",
    bg: "bg-slate-50 border-slate-200 dark:bg-emerald-500/10",
    icon: Minus,
    label: "LOW",
    iconColor: "text-slate-500"
  },
  default: {
    color: "text-muted-foreground",
    bg: "bg-muted/10 border-muted/20",
    icon: Info,
    label: "UNSPECIFIED",
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

  const isHighSeverity = ["critical", "emergency", "urgent"].includes(normalizedPriority);

  if (!showLabel) {
    return (
      <div className={cn("inline-flex items-center justify-center", className)} title={config.label}>
        <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4", config.iconColor || "currentColor")} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-tight transition-all",
        config.bg,
        config.color,
        config.glow,
        size === "sm" ? "py-0.5 px-2 text-[10px]" : "py-1 px-3 text-[11px]",
        className
      )}
      title={`Priority Protocol: ${config.label}`}
    >
      {/* Tactical Pulse for Critical Items */}
      {isHighSeverity && (
        <span className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse-slow -z-10" />
      )}

      <Icon
        className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
        strokeWidth={3}
      />

      <span className="leading-none select-none">{config.label}</span>
    </div>
  );
}
