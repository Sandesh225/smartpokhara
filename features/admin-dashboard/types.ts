export interface AdminDashboardMetrics {
  totalComplaints: number;
  resolvedComplaints: number;
  revenue: number;
  activeTasks: number;
  totalUsers?: number;
  totalStaff?: number;
  totalWards?: number;
}

export type AdminMetrics = AdminDashboardMetrics;

export interface DashboardActivity {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  citizen?: { email: string } | null;
}

export interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  assignee?: string;
  is_overdue?: boolean;
}

export interface DashboardTrend {
  date: string;
  count: number;
}

export interface AdminDashboardData {
  metrics: AdminMetrics;
  recentComplaints: DashboardActivity[];
  recentTasks: DashboardTask[];
  trends: DashboardTrend[];
  statusDist: { status: string; count: number }[];
  deptWorkload: DepartmentPerformance[];
  wardStats: WardAnalytics[];
  paymentStats?: any[];
  websiteAnalytics?: any[];
}

export interface CitizenDashboardStats {
  complaints: { total: number; open: number; in_progress: number; resolved: number };
  bills: { total: number; pending: number; overdue: number; total_due: number };
  notifications: number;
  notices: number;
}

export interface DepartmentPerformance {
  id: string;
  name: string;
  department_name: string; // Alias for backward compatibility
  active_count: number;
  overdue_count: number;
  total_resolved: number;
  sla_compliance: number;
  head_name?: string;
}

export interface WardAnalytics {
  ward_number: number;
  complaint_count: number;
  resolved_count: number;
  revenue: number;
}

export type WardStat = WardAnalytics;

export interface ComplaintStatusData {
  status: string;
  count: number;
  color?: string;
}

export interface DepartmentWorkload extends DepartmentPerformance {}

export interface PaymentStat {
  category: string;
  amount: number;
  count: number;
}

export interface TaskSummary {
  status: string;
  count: number;
}

export interface TaskSummaryDetail extends DashboardTask {}

export interface TrendDataPoint {
  date: string;
  value: number;
  resolved?: number;
}

export interface WebsiteMetric {
  label: string;
  value: string | number;
  trend: "up" | "down";
  change?: string;
  isPositive?: boolean;
}

export interface UserGrowth {
  month: string;
  count: number;
}
