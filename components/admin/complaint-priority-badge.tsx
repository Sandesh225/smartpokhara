// components/admin/complaint-priority-badge.tsx
import { Badge } from "@/components/ui/badge";
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
    variant: "default" | "secondary" | "destructive" | "outline";
    color: string;
    icon?: string;
  }
> = {
  low: { 
    label: "Low", 
    variant: "outline", 
    color: "text-green-600 border-green-200 bg-green-50" 
  },
  medium: { 
    label: "Medium", 
    variant: "secondary", 
    color: "text-yellow-600 border-yellow-200 bg-yellow-50" 
  },
  high: { 
    label: "High", 
    variant: "default", 
    color: "text-orange-600 border-orange-200 bg-orange-50" 
  },
  critical: { 
    label: "Critical", 
    variant: "destructive", 
    color: "text-red-600 border-red-200 bg-red-50" 
  },
};

const sizeClasses = {
  xs: "text-xs px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function ComplaintPriorityBadge({
  priority,
  size = "md",
  showLabel = true,
}: ComplaintPriorityBadgeProps) {
  const config = priorityConfig[priority] || { 
    label: priority, 
    variant: "outline", 
    color: "" 
  };

  return (
    <Badge 
      variant={config.variant} 
      className={`${sizeClasses[size]} ${config.color} font-medium`}
    >
      {showLabel ? config.label : priority.charAt(0).toUpperCase()}
    </Badge>
  );
}