import { SLA_DEADLINES, ALERT_THRESHOLDS, WORKLOAD_THRESHOLDS } from "@/lib/config/constants";
import type { StaffProfile, AssignableStaff } from "@/lib/types/supervisor.types";
import { calculateDistance } from "@/lib/utils/location-helpers";
export { calculateDistance };

// --- Assignment Helpers ---
// calculateDistance is imported from location-helpers

export function checkWorkloadCapacity(staff: StaffProfile): { isOverloaded: boolean; percentage: number } {
  const capacity = staff.max_concurrent_assignments || WORKLOAD_THRESHOLDS.MAX_CONCURRENT_COMPLAINTS;
  const current = staff.current_workload || 0;
  const percentage = Math.min(100, Math.round((current / capacity) * 100));
  
  return {
    isOverloaded: percentage >= 80, // Using 80% as warning threshold
    percentage
  };
}

export function getSuggestedStaff(
  staffList: StaffProfile[],
  complaintLocation?: { lat: number; lng: number } | null
): AssignableStaff[] {
   return staffList.map(s => ({
       ...s,
       capacity_percentage: (s.current_workload / (s.max_concurrent_assignments || 1)) * 100,
       distance_km: null,
       is_available: true,
       recommendation_rank: 0
   }));
}

export function distributeEvenly(
  assignments: { id: string; type: 'complaint'|'task'; staffId: string }[],
  staffList: StaffProfile[]
) {
  const moves: { assignmentId: string; type: 'complaint'|'task'; fromStaff: string; toStaff: string }[] = [];
  
  const overloadedStaff = staffList.filter(s => checkWorkloadCapacity(s).isOverloaded);
  const availableStaff = staffList.filter(s => {
    const { percentage } = checkWorkloadCapacity(s);
    return percentage < 50 && s.availability_status === 'available';
  });

  if (availableStaff.length === 0) return [];

  let targetIndex = 0;
  
  overloadedStaff.forEach(source => {
    const sourceAssignments = assignments.filter(a => a.staffId === source.user_id);
    const toMove = sourceAssignments.slice(0, 2); 
    
    toMove.forEach(assignment => {
      const target = availableStaff[targetIndex];
      if (target) {
        moves.push({
            assignmentId: assignment.id,
            type: assignment.type,
            fromStaff: source.user_id,
            toStaff: target.user_id
        });
        targetIndex = (targetIndex + 1) % availableStaff.length;
      }
    });
  });

  return moves;
}

// --- SLA Helpers ---

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
  const config = SLA_DEADLINES?.[priority as keyof typeof SLA_DEADLINES] || SLA_DEADLINES?.default;
  const hours = config?.resolution || 48;
  
  const deadline = new Date(submittedAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

export function getRemainingTime(deadline: Date | string, completed?: boolean): SLARemaining {
  if (completed) {
    return { hours: 0, minutes: 0, seconds: 0, isOverdue: false, percentage: 100, status: 'completed' };
  }

  const now = new Date();
  const dueDate = new Date(deadline);
  const diff = dueDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isOverdue: true, percentage: 100, status: 'overdue' };
  }

  const assumedDuration = 72 * 60 * 60 * 1000; 
  const elapsed = assumedDuration - diff;
  const percentage = Math.min(100, Math.max(0, (elapsed / assumedDuration) * 100));

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let status: SLARemaining['status'] = 'on_time';
  if (hours < 4) status = 'at_risk';

  return { hours, minutes, seconds, isOverdue: false, percentage: Math.round(percentage), status };
}

export function getSLAStatus(deadline: Date | string, status: string): SLAStatus {
  if (status === 'resolved' || status === 'closed') {
    return { status: 'completed', color: 'green', icon: '✅', label: 'Completed', description: 'SLA completed on time' };
  }

  const remaining = getRemainingTime(deadline);

  switch (remaining.status) {
    case 'overdue':
      return { status: 'overdue', color: 'red', icon: '⚠️', label: 'Overdue', description: 'SLA deadline has passed' };
    case 'at_risk':
      return { status: 'at_risk', color: 'orange', icon: '⏰', label: 'At Risk', description: 'Approaching SLA deadline' };
    default:
      return { status: 'on_time', color: 'blue', icon: '✓', label: 'On Track', description: 'SLA on track' };
  }
}

export function formatCountdown(deadline: Date | string, completed?: boolean): string {
  if (completed) return 'Completed';

  const remaining = getRemainingTime(deadline);

  if (remaining.isOverdue) {
    const now = new Date().getTime();
    const due = new Date(deadline).getTime();
    const hours = Math.floor(Math.abs(now - due) / (1000 * 60 * 60));
    return `Overdue by ${hours}h`;
  }

  if (remaining.hours < 24) {
    return `${remaining.hours}h ${remaining.minutes}m`;
  }

  const days = Math.floor(remaining.hours / 24);
  const hours = remaining.hours % 24;
  return `${days}d ${hours}h`;
}

// --- Performance/Report Helpers ---

export function calculateResolutionTime(
  completedItems: { submitted_at: string; resolved_at: string }[]
): number {
  if (!completedItems || completedItems.length === 0) return 0;

  const totalMs = completedItems.reduce((acc, curr) => {
    const start = new Date(curr.submitted_at).getTime();
    const end = new Date(curr.resolved_at).getTime();
    return acc + Math.max(0, end - start);
  }, 0);

  return Math.round((totalMs / completedItems.length / (1000 * 60 * 60)) * 10) / 10;
}

export function calculateSLACompliance(total: number, onTime: number): number {
  if (total === 0) return 100;
  return Math.round((onTime / total) * 100);
}
