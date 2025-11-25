// ============================================================================
// FILE: lib/types.ts
// TypeScript types (unchanged)
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole =
  | "admin"
  | "dept_head"
  | "dept_staff"
  | "ward_staff"
  | "field_staff"
  | "citizen"
  | "business_owner"
  | "tourist";

export interface Complaint {
  id: string;
  trackingCode: string;
  citizenId: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
  description: string;
  wardId?: string;
  status: ComplaintStatus;
  priority: Priority;
  assignedDepartmentId?: string;
  assignedStaffId?: string;
  submittedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  slaUeAt?: Date;
  isEscalated: boolean;
  resolutionNotes?: string;
  citizenSatisfactionRating?: number;
  citizenFeedback?: string;
}

export type ComplaintStatus =
  | "draft"
  | "submitted"
  | "received"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected"
  | "escalated";

export type Priority = "low" | "medium" | "high" | "critical";

export interface Notice {
  id: string;
  title: string;
  body: string;
  status: NoticeStatus;
  priority: Priority;
  audienceScope: string;
  publishedAt?: Date;
  expiredAt?: Date;
  authorUserId: string;
  viewCount: number;
}

export type NoticeStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived"
  | "expired";

export interface DashboardMetrics {
  totalComplaints: number;
  activeComplaints: number;
  resolvedToday: number;
  todayRevenue: number;
  complaintTrend: Array<{ date: string; count: number }>;
  wardHeatmap: Array<{ ward: number; complaints: number }>;
  departmentWorkload: Array<{ name: string; open: number; overdue: number }>;
  tasksOverview: { open: number; overdue: number; dueToday: number };
}
