import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COMPLAINT_STATUS_CONFIG } from "./complaint";
import { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  // Safe access in case status is unknown
  const config =
    COMPLAINT_STATUS_CONFIG[status as keyof typeof COMPLAINT_STATUS_CONFIG];

  if (!config)
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );

  const Icon = config.icon as LucideIcon;

  return (
    <Badge
      className={cn(
        "px-3 py-1.5 gap-1.5 border font-medium text-white",
        config.color,
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}
