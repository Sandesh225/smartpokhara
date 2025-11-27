// lib/types/admin.ts

export interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  escalated: number;
  avg_resolution_days: number;
}

export interface DepartmentWorkload {
  department_id: string;
  department_name: string;
  total_complaints: number;
  open_complaints: number;
  overdue_complaints: number;
  avg_resolution_days: number;
}

export interface StaffWorkload {
  staff_id: string;
  staff_name: string;
  staff_email: string;
  department_name: string | null;
  active_complaints: number;
  overdue_complaints: number;
  resolved_this_month: number;
}

export interface ComplaintFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  department: string;
  ward: string;
  assignedStaff: string;
  isOverdue: boolean | null;
  isEscalated: boolean | null;
  dateFrom: string;
  dateTo: string;
}

export interface BulkActionResult {
  success: boolean;
  message: string;
  updated_count?: number;
}