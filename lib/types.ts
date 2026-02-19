// ============================================================================
// FILE: lib/types.ts
// Shared TypeScript types — aligned with SQL schema
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
  | "tourist"
  | "call_center";

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
  slaDueAt?: Date;
  source?: string;
  resolutionNotes?: string;
  commentCount?: number;
  attachmentCount?: number;
  upvoteCount?: number;
}

export type ComplaintStatus =
  | "pending"
  | "received"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected"
  | "reopened";

export type Priority = "low" | "medium" | "high" | "urgent" | "critical";

export interface Notice {
  id: string;
  title: string;
  content: string;
  notice_type: string;
  is_public: boolean;
  is_urgent: boolean;
  excerpt?: string;
  ward_id?: string | null;
  published_at?: string;
  expires_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at?: string;
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

export interface CurrentUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  ward_id?: string | null;
  department_id?: string | null;
  is_active: boolean;
  avatar_url?: string | null;
  staff_profile?: any;
  permissions?: string[];
}

export type ComplaintScope = "all" | "assigned" | "ward" | "department";

export interface SearchComplaintsParams {
  search?: string;
  status?: string[];
  priority?: string[];
  ward_id?: string;
  category_id?: string;
  scope?: ComplaintScope;
  assignee_id?: string;
  dateRange?: { from?: Date; to?: Date };
  page?: number;
  pageSize?: number;
}
