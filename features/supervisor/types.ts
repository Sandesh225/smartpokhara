import { Database } from "@/lib/types/database.types";
import { StaffRole } from "../staff/types";

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

export interface CategoryBreakdown {
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

// Supervisor-specific extended staff info
export interface ManagedStaffMember {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  staff_code?: string;
  department_id?: string;
  ward_id?: string;
  current_workload?: number;
  availability_status?: string;
  performance_rating?: number;
  checkIn?: string;
  checkOut?: string;
}
