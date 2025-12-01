export interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  escalated: number;
  overdue: number;
  avg_resolution_days?: number;
}

export interface PriorityAlert {
  id: string;
  tracking_code: string;
  title: string;
  priority: string;
  status: string;
  assigned_staff_name?: string | null;
  department_name?: string | null;
  days_overdue: number;
  sla_due_at: string;
}

export interface WardSummary {
  ward_number: number;
  ward_name: string;
  total_complaints: number;
  open_complaints: number;
  resolved_complaints: number;
  overdue_complaints: number;
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

export interface FilterCountItem {
  value: string;
  label?: string;
  count: number;
}

export interface FilterCounts {
  status: FilterCountItem[];
  priority: FilterCountItem[];
  categories: FilterCountItem[];
  departments: FilterCountItem[];
  wards: FilterCountItem[];
}
