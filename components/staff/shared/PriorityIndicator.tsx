import { AlertCircle, ArrowUp, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityIndicatorProps {
  priority: string;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function PriorityIndicator({ 
  priority, 
  size = "md", 
  showLabel = true,
  className 
}: PriorityIndicatorProps) {
  const p = priority?.toLowerCase() || "low";
  
  const config = {
    critical: {
      label: "Critical",
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      iconColor: "text-red-600"
    },
    urgent: {
      label: "Urgent",
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      iconColor: "text-red-600"
    },
    high: {
      label: "High",
      icon: ArrowUp,
      color: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600"
    },
    medium: {
      label: "Medium",
      icon: AlertTriangle, // or a dash/arrow
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600"
    },
    low: {
      label: "Low",
      icon: Minus,
      color: "text-gray-600",
      bg: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-500"
    }
  };

  // Fallback to low if unknown
  const style = config[p as keyof typeof config] || config.low;
  const Icon = style.icon;
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  if (!showLabel) {
    return (
      <div className={cn("inline-flex items-center justify-center", className)} title={style.label}>
        <Icon className={cn(iconSize, style.iconColor)} />
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium",
      style.bg,
      style.color,
      className
    )}>
      <Icon className={iconSize} />
      <span>{style.label}</span>
    </div>
  );
}