import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COMPLAINT_STATUS_CONFIG } from "../../app/(protected)/citizen/complaints/_components/form-steps/complaint";
import { LucideIcon, CheckCircle2, Loader2, AlertCircle, XCircle, CheckSquare } from "lucide-react";

export type StatusVariant = 'complaint' | 'task' | 'pb' | 'notice' | 'staff';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  variant = 'complaint',
  className,
  showIcon = true,
}: StatusBadgeProps) {
  // Config selection based on variant
  const getConfigs = () => {
      if (variant === 'task') {
          return {
              'not_started': { label: 'To Do', color: 'bg-gray-500', icon: CheckSquare },
              'in_progress': { label: 'In Progress', color: 'bg-blue-600', icon: Loader2 },
              'completed': { label: 'Completed', color: 'bg-green-600', icon: CheckCircle2 },
              'overdue': { label: 'Overdue', color: 'bg-red-600', icon: AlertCircle },
              'cancelled': { label: 'Cancelled', color: 'bg-gray-400', icon: XCircle }
          };
      }
      if (variant === 'staff') {
          return {
              'active': { label: 'Active', color: 'bg-green-600', icon: CheckCircle2 },
              'inactive': { label: 'Inactive', color: 'bg-gray-400', icon: XCircle },
              'on_leave': { label: 'On Leave', color: 'bg-amber-500', icon: AlertCircle },
              'field': { label: 'In Field', color: 'bg-blue-600', icon: Loader2 }
          };
      }
      return COMPLAINT_STATUS_CONFIG;
  };

  const configs = getConfigs();
  const config = configs[status as keyof typeof configs];

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
