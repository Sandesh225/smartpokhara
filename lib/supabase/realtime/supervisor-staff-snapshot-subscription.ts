import type { SupabaseClient } from "@supabase/supabase-js";
import { supervisorStaffQueries } from "./supervisor-staff";

// Constants for thresholds
const OVERLOAD_THRESHOLD = 80;
const UNDERUTILIZED_THRESHOLD = 30;

export interface StaffSnapshotItem {
  staffId: string;
  name: string;
  photoUrl?: string;
  role: string;
  status: string; // 'available' | 'busy' | 'off_duty' | 'on_leave'
  workloadPercent: number;
  activeComplaintsCount: number;
  activeTasksCount: number;
  completedTodayCount: number;
  overdueComplaintsCount: number;
  performanceScore: number;
  slaCompliancePercent: number;
  isOverloaded: boolean;
  isUnderutilized: boolean;
}

export interface TeamSnapshotSummary {
  totalStaff: number;
  activeCount: number;
  onBreakCount: number;
  offDutyCount: number;
  onLeaveCount: number;
  overloadedCount: number;
  underutilizedCount: number;
  averageWorkloadPercent: number;
}

export const supervisorStaffSnapshotQueries = {
  /**
   * Fetches the complete snapshot for the Staff Sidebar.
   */
  async getStaffSnapshot(client: SupabaseClient, supervisorId: string) {
    // 1. Get Base Staff List
    const staffList = await supervisorStaffQueries.getSupervisedStaff(client, supervisorId);
    const staffIds = staffList.map(s => s.user_id);

    if (staffIds.length === 0) {
      return {
        staff: [],
        summary: {
          totalStaff: 0, activeCount: 0, onBreakCount: 0, offDutyCount: 0, 
          onLeaveCount: 0, overloadedCount: 0, underutilizedCount: 0, averageWorkloadPercent: 0
        }
      };
    }

    const today = new Date().toISOString().split('T')[0];

    // 2. Parallel Fetch for Metrics
    const [complaintsRes, tasksRes, completedRes] = await Promise.all([
      // Active & Overdue Complaints
      client.from("complaints")
        .select("assigned_staff_id, status, sla_due_at")
        .in("assigned_staff_id", staffIds)
        .in("status", ["assigned", "in_progress"]),
      
      // Active Tasks
      client.from("supervisor_tasks")
        .select("primary_assigned_to, status")
        .in("primary_assigned_to", staffIds)
        .neq("status", "completed"),
        
      // Completed Today (Tasks + Complaints)
      client.from("complaint_updates") // Assuming updates table tracks completion events
        .select("created_by")
        .in("created_by", staffIds)
        .eq("update_type", "status_change")
        .eq("new_status", "resolved")
        .gte("created_at", today)
    ]);

    // 3. Process Data per Staff
    const staffSnapshots: StaffSnapshotItem[] = staffList.map(staff => {
      const activeComplaints = complaintsRes.data?.filter(c => c.assigned_staff_id === staff.user_id) || [];
      const activeTasks = tasksRes.data?.filter(t => t.primary_assigned_to === staff.user_id) || [];
      const completedToday = completedRes.data?.filter(l => l.created_by === staff.user_id).length || 0;
      
      const overdueCount = activeComplaints.filter(c => new Date(c.sla_due_at) < new Date()).length;
      
      const totalActive = activeComplaints.length + activeTasks.length;
      const capacity = staff.max_concurrent_assignments || 10;
      const workloadPercent = Math.min(100, Math.round((totalActive / capacity) * 100));

      return {
        staffId: staff.user_id,
        name: staff.full_name,
        photoUrl: staff.avatar_url,
        role: staff.role,
        status: staff.availability_status,
        workloadPercent,
        activeComplaintsCount: activeComplaints.length,
        activeTasksCount: activeTasks.length,
        completedTodayCount: completedToday,
        overdueComplaintsCount: overdueCount,
        performanceScore: staff.performance_rating * 20, // Scale 0-5 to 0-100
        slaCompliancePercent: 95, // Mock or fetch actual calc
        isOverloaded: workloadPercent >= OVERLOAD_THRESHOLD,
        isUnderutilized: workloadPercent <= UNDERUTILIZED_THRESHOLD && staff.availability_status === 'available'
      };
    });

    // 4. Calculate Team Summary
    const summary: TeamSnapshotSummary = {
      totalStaff: staffSnapshots.length,
      activeCount: staffSnapshots.filter(s => s.status === 'available' || s.status === 'busy').length,
      onBreakCount: staffSnapshots.filter(s => s.status === 'on_break').length,
      offDutyCount: staffSnapshots.filter(s => s.status === 'off_duty').length,
      onLeaveCount: staffSnapshots.filter(s => s.status === 'on_leave').length,
      overloadedCount: staffSnapshots.filter(s => s.isOverloaded).length,
      underutilizedCount: staffSnapshots.filter(s => s.isUnderutilized).length,
      averageWorkloadPercent: Math.round(staffSnapshots.reduce((acc, s) => acc + s.workloadPercent, 0) / (staffSnapshots.length || 1))
    };

    return { staff: staffSnapshots, summary };
  }
};