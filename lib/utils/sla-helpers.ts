import { SLA_DEADLINES, ALERT_THRESHOLDS } from '../constants/sla-config';

export interface SLARemaining {
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
  percentage: number;
  status: 'on_time' | 'at_risk' | 'overdue' | 'completed';
}

export interface SLAStatus {
  status: 'on_time' | 'at_risk' | 'overdue' | 'completed';
  color: string;
  icon: string;
  label: string;
  description: string;
}

export function calculateSLADeadline(
  priority: string,
  submittedAt: Date
): Date {
  // Safe access to SLA config with default fallback
  const config = SLA_DEADLINES?.[priority as keyof typeof SLA_DEADLINES] || SLA_DEADLINES?.default;
  const hours = config?.resolution || 48; // Default to 48h if config missing
  
  const deadline = new Date(submittedAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

export function getRemainingTime(deadline: Date | string, completed?: boolean): SLARemaining {
  if (completed) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOverdue: false,
      percentage: 100,
      status: 'completed'
    };
  }

  const now = new Date();
  const dueDate = new Date(deadline);
  const diff = dueDate.getTime() - now.getTime();

  // Constants for thresholds (fallback if import fails)
  const BREACH_THRESHOLD = ALERT_THRESHOLDS?.BREACH || 1.0;
  const WARNING_THRESHOLD = ALERT_THRESHOLDS?.FINAL_WARNING || 0.9;

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOverdue: true,
      percentage: 100,
      status: 'overdue'
    };
  }

  const originalDueDate = new Date(deadline); // Approximation if start time unknown
  // For accurate percentage, we'd need start time. Assuming 72h window for progress bar visual if unknown.
  const assumedDuration = 72 * 60 * 60 * 1000; 
  const elapsed = assumedDuration - diff;
  const percentage = Math.min(100, Math.max(0, (elapsed / assumedDuration) * 100));

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let status: SLARemaining['status'] = 'on_time';
  // Logic: As time decreases, urgency increases. 
  // If we rely on percentage of *elapsed* time:
  // > 90% elapsed = At Risk
  // > 100% elapsed = Overdue
  // Simpler logic based on hours remaining:
  if (hours < 4) status = 'at_risk';

  return {
    hours,
    minutes,
    seconds,
    isOverdue: false,
    percentage: Math.round(percentage),
    status
  };
}

export function getSLAStatus(
  deadline: Date | string,
  status: string
): SLAStatus {
  if (status === 'resolved' || status === 'closed') {
    return {
      status: 'completed',
      color: 'green',
      icon: '✅',
      label: 'Completed',
      description: 'SLA completed on time'
    };
  }

  const remaining = getRemainingTime(deadline);

  switch (remaining.status) {
    case 'overdue':
      return {
        status: 'overdue',
        color: 'red',
        icon: '⚠️',
        label: 'Overdue',
        description: 'SLA deadline has passed'
      };
    case 'at_risk':
      return {
        status: 'at_risk',
        color: 'orange',
        icon: '⏰',
        label: 'At Risk',
        description: 'Approaching SLA deadline'
      };
    default:
      return {
        status: 'on_time',
        color: 'blue',
        icon: '✓',
        label: 'On Track',
        description: 'SLA on track'
      };
  }
}

export function formatCountdown(deadline: Date | string, completed?: boolean): string {
  if (completed) return 'Completed';

  const remaining = getRemainingTime(deadline);

  if (remaining.isOverdue) {
    // Determine how long overdue
    const now = new Date().getTime();
    const due = new Date(deadline).getTime();
    const diff = Math.abs(now - due);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    return `Overdue by ${hours}h`;
  }

  if (remaining.hours < 24) {
    return `${remaining.hours}h ${remaining.minutes}m`;
  }

  const days = Math.floor(remaining.hours / 24);
  const hours = remaining.hours % 24;
  return `${days}d ${hours}h`;
}

export function calculateSLACompliance(
  resolvedCount: number,
  onTimeCount: number
): number {
  if (resolvedCount === 0) return 100;
  return Math.round((onTimeCount / resolvedCount) * 100);
}