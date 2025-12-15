export interface AdminDashboardMetrics {
  totalComplaints: number;
  resolvedComplaints: number;
  revenue: number;
  activeTasks: number;
}

export interface ComplaintStatusData {
  status: string;
  count: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface DepartmentWorkload {
  id: string;
  name: string;
  active_count: number;
  overdue_count: number;
}

export interface WardStat {
  ward_number: number;
  complaint_count: number;
  resolved_count: number;
}

export interface TaskSummary {
  id: string;
  title: string;
  assignee: string;
  status: string;
  due_date: string;
  is_breached: boolean;
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  statusDist: ComplaintStatusData[];
  trends: TrendDataPoint[];
  deptWorkload: DepartmentWorkload[];
  wardStats: WardStat[];
  recentTasks: TaskSummary[];
}
