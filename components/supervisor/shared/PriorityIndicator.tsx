import { AlertCircle, AlertTriangle, Flag, Info, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export type PriorityLevel =
  | "critical"
  | "emergency"
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
  { color: string; bg: string; icon: any; label: string; glow?: string }
> = {
  critical: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/20 dark:bg-red-500/15 dark:border-red-500/30",
    icon: Flame,
    label: "CRITICAL",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)] dark:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
  },
  emergency: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/20 dark:bg-red-500/15 dark:border-red-500/30",
    icon: AlertCircle,
    label: "EMERGENCY",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  },
  high: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20 dark:bg-orange-500/15",
    icon: AlertTriangle,
    label: "HIGH",
  },
  medium: {
    color: "text-primary dark:text-primary-light",
    bg: "bg-primary/10 border-primary/20",
    icon: Flag,
    label: "MEDIUM",
  },
  low: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: Info,
    label: "LOW",
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

  const isHighSeverity = ["critical", "emergency"].includes(normalizedPriority);

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-md border font-black uppercase tracking-widest transition-all",
        config.bg,
        config.color,
        config.glow,
        size === "sm" ? "py-0.5 px-2 text-[9px]" : "py-1 px-3 text-[10px]",
        className
      )}
      title={`Priority Protocol: ${config.label}`}
    >
      {/* Tactical Pulse for Critical Items */}
      {isHighSeverity && (
        <span className="absolute inset-0 rounded-md bg-red-500/20 animate-pulse-slow -z-10" />
      )}

      <Icon
        className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
        strokeWidth={3}
      />

      {showLabel && (
        <span className="leading-none select-none">{config.label}</span>
      )}
    </div>
  );
}
