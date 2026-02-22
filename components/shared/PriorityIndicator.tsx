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
  { color: string; bg: string; icon: any; label: string; iconColor?: string }
> = {
  critical: {
    color: "text-destructive-foreground",
    bg: "bg-destructive border-destructive",
    icon: Flame,
    label: "CRITICAL",
    iconColor: "text-destructive-foreground"
  },
  emergency: {
    color: "text-destructive-foreground",
    bg: "bg-destructive/90 border-border",
    icon: AlertCircle,
    label: "EMERGENCY",
    iconColor: "text-destructive-foreground"
  },
  urgent: {
    label: "URGENT",
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    iconColor: "text-destructive"
  },
  high: {
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    icon: ArrowUp,
    label: "HIGH",
    iconColor: "text-destructive"
  },
  medium: {
    color: "text-secondary-foreground",
    bg: "bg-secondary/20 border-secondary/30",
    icon: AlertTriangle,
    label: "MEDIUM",
    iconColor: "text-secondary-foreground"
  },
  low: {
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
    icon: Minus,
    label: "LOW",
    iconColor: "text-muted-foreground"
  },
  default: {
    color: "text-muted-foreground",
    bg: "bg-muted/50 border-border",
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
        isHighSeverity && "shadow-md",
        size === "sm" ? "py-0.5 px-2 text-xs" : "py-1 px-3 text-sm",
        className
      )}
      title={`Priority Protocol: ${config.label}`}
    >
      {/* Tactical Pulse for Critical Items */}
      {isHighSeverity && (
        <span className="absolute inset-0 rounded-full bg-destructive/10 animate-pulse-slow -z-10" />
      )}

      <Icon
        className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
        strokeWidth={3}
      />

      <span className="leading-none select-none">{config.label}</span>
    </div>
  );
}
