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

export type StatusVariant = 'complaint' | 'task' | 'pb' | 'notice' | 'staff' | 'citizen';

interface StatusBadgeProps {
  status: string | boolean;
  variant?: StatusVariant;
  className?: string;
  showIcon?: boolean;
  animate?: boolean;
}

export function StatusBadge({
  status: rawStatus,
  variant = 'complaint',
  className,
  showIcon = true,
  animate: forcedAnimate,
}: StatusBadgeProps) {
  // Config selection based on variant
  const getConfigs = () => {
    if (variant === 'task') {
      return {
        'not_started': { label: 'To Do', color: 'bg-muted text-muted-foreground border-border', icon: CheckSquare },
        'in_progress': { label: 'In Progress', color: 'bg-primary/10 text-primary border-primary/20', icon: Loader2, animate: true },
        'completed': { label: 'Completed', color: 'bg-secondary/20 text-secondary-foreground border-secondary/30', icon: CheckCircle2 },
        'overdue': { label: 'Overdue', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle },
        'cancelled': { label: 'Cancelled', color: 'bg-muted text-muted-foreground/60 border-border', icon: XCircle },
        'paused': { label: 'Paused', color: 'bg-accent/20 text-accent-foreground border-accent/30', icon: PauseCircle }
      };
    }
    if (variant === 'staff') {
      return {
        'active': { label: 'Available', color: 'bg-secondary/20 text-secondary-foreground border-secondary/30', icon: CheckCircle2 },
        'available': { label: 'Available', color: 'bg-secondary/20 text-secondary-foreground border-secondary/30', icon: CheckCircle2 },
        'busy': { label: 'Busy', color: 'bg-accent/20 text-accent-foreground border-accent/30', icon: Briefcase },
        'inactive': { label: 'Offline', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
        'on_leave': { label: 'On Leave', color: 'bg-accent/10 text-accent-foreground border-accent/20', icon: PauseCircle },
        'on_break': { label: 'On Break', color: 'bg-secondary/10 text-secondary border-secondary/20', icon: PauseCircle },
        'field': { label: 'In Field', color: 'bg-primary/10 text-primary border-primary/20', icon: Activity, animate: true },
        'off_duty': { label: 'Off Duty', color: 'bg-muted text-muted-foreground border-border', icon: Clock }
      };
    }
    if (variant === 'citizen') {
      return {
        'true': { label: 'Active', color: 'bg-secondary/20 text-secondary-foreground border-secondary/30', icon: CheckCircle2 },
        'false': { label: 'Inactive', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
        'active': { label: 'Active', color: 'bg-secondary/20 text-secondary-foreground border-secondary/30', icon: CheckCircle2 },
        'inactive': { label: 'Inactive', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
      };
    }
    
    // Complaint statuses
    const complaintConfigs: Record<string, { color: string; icon: LucideIcon; label: string; animate?: boolean }> = {
      received: { color: "bg-primary/10 text-primary border-primary/20", icon: AlertCircle, label: "Received" },
      assigned: { color: "bg-accent/10 text-accent-foreground border-accent/20", icon: ArrowUpCircle, label: "Assigned" },
      in_progress: { color: "bg-primary/10 text-primary border-primary/20", icon: Clock, label: "In Progress", animate: true },
      resolved: { color: "bg-secondary/20 text-secondary-foreground border-secondary/30", icon: CheckCircle2, label: "Resolved" },
      closed: { color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2, label: "Closed" },
      escalated: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle, label: "Escalated" },
    };

    return { ...COMPLAINT_STATUS_CONFIG, ...complaintConfigs };
  };

  const configs = getConfigs();
  const status = typeof rawStatus === 'boolean' ? String(rawStatus) : rawStatus;
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  const config = (configs as any)[normalizedStatus] || {
    label: status,
    color: 'bg-muted text-muted-foreground border-border',
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
