import { Database } from "@/lib/types/database.types";

export type StaffRole = 'admin' | 'dept_head' | 'dept_staff' | 'ward_staff' | 'field_staff' | 'call_center';
export type StaffAvailability = 'available' | 'busy' | 'on_break' | 'off_duty' | 'on_leave' | 'training';
export type LeaveType = 'casual' | 'sick' | 'annual' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AdminStaffListItem {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  staff_code: string;
  staff_role: StaffRole;
  department_name: string | null;
  ward_number: number | null;
  is_supervisor: boolean;
  is_active: boolean;
  availability_status: StaffAvailability;
  current_workload: number;
  created_at: string;
  avatar_url?: string;
}

export interface StaffFiltersState {
  search: string;
  role: StaffRole | 'all';
  department_id: string | null;
  ward_id: string | null;
  status: 'active' | 'inactive' | 'all';
}

export interface CreateStaffInput {
  email: string;
  full_name: string;
  phone: string;
  staff_role: StaffRole;
  department_id?: string;
  ward_id?: string;
  is_supervisor: boolean;
  specializations?: string[];
  createdBy?: string;
}

export interface StaffPerformanceData {
  user_id: string;
  full_name: string;
  total_complaints: number;
  resolved_complaints: number;
  active_complaints: number;
  avg_assignment_hours: number;
  on_time_resolutions: number;
  avg_rating: number;
  current_workload: number;
}

export interface Achievement {
  id: string;
  badge_name: string;
  description: string;
  icon_key: 'star' | 'medal' | 'zap' | 'award' | string;
  earned_at: string;
}

export interface WorkAssignment {
  id: string;
  created_at: string;
  completed_at: string | null;
  due_at: string | null;
  assignment_status: 'not_started' | 'in_progress' | 'paused' | 'awaiting_parts' | 'awaiting_approval' | 'completed' | 'rejected' | 'cancelled';
  priority: string;
  complaint_id: string | null;
  task_id?: string | null;
}

export interface PerformanceMetrics {
  totalCompleted: number;
  slaCompliance: number;
  avgResolutionTime: number; // in hours
  avgRating: number;
}

export interface AttendanceStats {
  present_days: number;
  late_days: number;
  on_duty: boolean;
  today_hours: number;
}

export interface LeaveBalance {
  id?: string;
  staff_id: string;
  annual_allowed: number;
  annual_used: number;
  sick_allowed: number;
  sick_used: number;
  casual_allowed: number;
  casual_used: number;
  last_reset?: string;
  created_at?: string;
}

export interface LeaveRequest {
  id: string;
  staff_id: string;
  type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// SUPERVISOR & METRICS
// ==========================================

export interface SupervisorJurisdiction {
  assigned_wards: string[];
  assigned_departments: string[];
  is_senior: boolean;
}

export interface ComplaintMetrics {
  activeCount: number;
  unassignedCount: number;
  overdueCount: number;
  resolvedTodayCount: number;
  avgResolutionTimeHours: number;
  slaComplianceRate: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface TrendPoint {
  date: string;
  count: number;
  resolved: number;
}

export interface RecentActivityItem {
  id: string;
  description: string;
  timestamp: string;
  link: string;
  type: string;
}

export interface SupervisorTask {
  id: string;
  tracking_code: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  task_type: string;
  due_date: string;
  ward_id: string | null;
  primary_assigned_to: string | null;
  primary_assigned?: {
    user_id: string;
    full_name: string;
  } | null;
}

