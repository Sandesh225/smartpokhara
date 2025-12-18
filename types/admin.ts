import { Database } from "@/types/database.types"; // Assuming global types exist

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
  resolved_count?: number;
}

export interface TaskSummary {
  id: string;
  title: string;
  assignee: string;
  status: string;
  priority: string;
  due_date: string;
  is_overdue: boolean;
}

export interface PaymentStat {
  period: string; // 'Today', 'This Week', 'This Month'
  amount: number;
  count: number;
}

export interface WebsiteMetric {
  label: string;
  value: number | string;
  change?: number; // percentage
  trend?: 'up' | 'down' | 'neutral';
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  statusDist: ComplaintStatusData[];
  trends: TrendDataPoint[];
  deptWorkload: DepartmentWorkload[];
  wardStats: WardStat[];
  recentTasks: TaskSummary[];
  paymentStats: PaymentStat[];
  websiteAnalytics: WebsiteMetric[];
}