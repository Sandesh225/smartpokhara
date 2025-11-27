// lib/types/complaints.ts

export type ComplaintStatus =
  | "submitted"
  | "received"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected"
  | "escalated";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type ComplaintSource =
  | "web_portal"
  | "mobile_app"
  | "phone_call"
  | "walk_in"
  | "email"
  | "social_media";

export interface UserProfile {
  full_name: string | null;
  phone_number?: string | null;
}

export interface UserSummary {
  id: string;
  email: string;
  user_profiles: UserProfile | null;
}

export interface Category {
  id: string;
  name: string;
  code?: string;
  is_active?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  code?: string;
  category_id?: string;
}

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  is_active?: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head_user_id?: string;
  is_active?: boolean;
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  uploaded_at: string;
  uploaded_by_user_id?: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus;
  new_status: ComplaintStatus;
  note: string | null;
  changed_at: string;
  changed_by_user_id: string;
  changed_by?: UserSummary;
}

export interface ComplaintEscalation {
  id: string;
  complaint_id: string;
  reason: string;
  sla_breached: boolean;
  escalated_at: string;
  escalated_by_user_id: string;
  escalated_to_user_id: string | null;
  escalated_to_department_id: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  escalated_by_user?: UserSummary;
  escalated_to_user?: UserSummary;
  escalated_to_department?: Pick<Department, "name">;
}

export interface ComplaintInternalComment {
  id: string;
  complaint_id: string;
  comment: string;
  created_at: string;
  created_by_user_id: string;
  user?: UserSummary;
}

export interface ComplaintBase {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  source: ComplaintSource;
  submitted_at: string;
  sla_due_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  citizen_id: string;
  category_id: string;
  subcategory_id: string | null;
  ward_id: string;
  assigned_department_id: string | null;
  assigned_staff_id: string | null;
  address_text: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  resolution_notes: string | null;
  rejection_reason: string | null;
  is_escalated: boolean;
  escalated_at: string | null;
  citizen_satisfaction_rating: number | null;
  citizen_feedback: string | null;
}

export interface ComplaintFull extends ComplaintBase {
  category: Category | null;
  subcategory: Subcategory | null;
  ward: Ward | null;
  department: Department | null;
  assigned_staff: UserSummary | null;
  citizen: UserSummary | null;
  attachments?: ComplaintAttachment[];
  status_history?: ComplaintStatusHistory[];
  escalations?: ComplaintEscalation[];
  internal_comments?: ComplaintInternalComment[];
}

export interface ComplaintListItem {
  id: string;
  tracking_code: string;
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  submitted_at: string;
  category_name: string | null;
  ward_number: number | null;
  citizen_name: string | null;
  citizen_email: string | null;
  assigned_staff_name: string | null;
  is_overdue: boolean;
}