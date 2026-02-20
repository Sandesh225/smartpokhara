import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COMPLAINT_STATUS_CONFIG } from "../../app/(protected)/citizen/complaints/_components/form-steps/complaint";
import { 
  LucideIcon, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  XCircle, 
  CheckSquare,
  Clock,
  ArrowUpCircle,
  Activity,
  Briefcase,
  PauseCircle,
  HelpCircle
} from "lucide-react";

export type StatusVariant = 'complaint' | 'task' | 'pb' | 'notice' | 'staff' | 'priority';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  showIcon?: boolean;
  animate?: boolean;
}

export function StatusBadge({
  status,
  variant = 'complaint',
  className,
  showIcon = true,
  animate: forcedAnimate,
}: StatusBadgeProps) {
  // Config selection based on variant
  const getConfigs = () => {
    if (variant === 'task') {
      return {
        'not_started': { label: 'To Do', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckSquare },
        'in_progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Loader2, animate: true },
        'completed': { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        'overdue': { label: 'Overdue', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle },
        'cancelled': { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle },
        'paused': { label: 'Paused', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: PauseCircle }
      };
    }
    if (variant === 'staff') {
      return {
        'active': { label: 'Available', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        'available': { label: 'Available', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        'busy': { label: 'Busy', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Briefcase },
        'inactive': { label: 'Offline', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle },
        'on_leave': { label: 'On Leave', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: PauseCircle },
        'field': { label: 'In Field', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Activity, animate: true },
        'off_duty': { label: 'Off Duty', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock }
      };
    }
    if (variant === 'priority') {
        return {
          'critical': { label: 'Critical', color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
          'high': { label: 'High', color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertCircle },
          'medium': { label: 'Medium', color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Activity },
          'low': { label: 'Low', color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
        };
    }
    
    // Complaint statuses with soft colors from supervisor side
    const complaintConfigs: Record<string, { color: string; icon: LucideIcon; label: string; animate?: boolean }> = {
      received: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertCircle, label: "Received" },
      assigned: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: ArrowUpCircle, label: "Assigned" },
      in_progress: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "In Progress", animate: true },
      resolved: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Resolved" },
      closed: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: CheckCircle2, label: "Closed" },
      escalated: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "Escalated" },
    };

    return { ...COMPLAINT_STATUS_CONFIG, ...complaintConfigs };
  };

  const configs = getConfigs();
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  const config = (configs as any)[normalizedStatus] || {
    label: status,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: HelpCircle,
    animate: false
  };

  const Icon = (config as any).icon as LucideIcon;
  const isAnimating = forcedAnimate ?? (config as any).animate;

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 gap-1.5 border font-medium shadow-sm transition-all select-none",
        config.color,
        className
      )}
    >
      {isAnimating ? (
         <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
         </span>
      ) : (
        showIcon && <Icon className="h-3.5 w-3.5" />
      )}
      <span className="capitalize">{config.label || status.replace(/_/g, ' ')}</span>
    </Badge>
  );
}
