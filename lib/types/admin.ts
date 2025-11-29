// lib/types/admin.ts
export interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  escalated: number;
  overdue: number;
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
  avg_resolution_days: number;
}

export interface PriorityAlert {
  id: string;
  tracking_code: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  status: string;
  days_overdue: number;
  assigned_staff_name: string | null;
  department_name: string | null;
}

export interface WardSummary {
  ward_number: number;
  ward_name: string;
  total_complaints: number;
  open_complaints: number;
  resolved_complaints: number;
  overdue_complaints: number;
}
