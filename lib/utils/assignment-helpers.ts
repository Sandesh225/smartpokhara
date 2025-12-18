import type { StaffProfile, AssignableStaff } from "@/lib/types/supervisor.types";

const WORKLOAD_THRESHOLD_PERCENT = 80;

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Simple Mock or Haversine logic
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111; 
}

export function checkWorkloadCapacity(staff: StaffProfile): { isOverloaded: boolean; percentage: number } {
  const capacity = staff.max_concurrent_assignments || 5;
  const current = staff.current_workload || 0;
  const percentage = Math.min(100, Math.round((current / capacity) * 100));
  
  return {
    isOverloaded: percentage >= WORKLOAD_THRESHOLD_PERCENT,
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

/**
 * Distributes assignments to balance workload.
 */
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