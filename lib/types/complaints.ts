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

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type ComplaintSource =
  | "web"
  | "mobile"
  | "phone"
  | "email"
  | "walk_in"
  | "social_media";

export interface ComplaintCategory {
  id: string;
  name: string;
  name_nepali?: string | null;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  display_order: number;
}

export interface ComplaintSubcategory {
  id: string;
  category_id: string;
  name: string;
  name_nepali?: string | null;
  description?: string | null;
  sla_days: number | null;
  is_active: boolean;
}

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali?: string | null;
  is_active: boolean;
  office_address?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  population?: number | null;
  area_sq_km?: number | null;
}

export interface Department {
  id: string;
  name: string;
  name_nepali?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}

export interface Complaint {
  id: string;
  tracking_code: string;
  citizen_id: string;
  category_id: string;
  subcategory_id?: string | null;
  ward_id: string;
  department_id?: string | null;
  assigned_staff_id?: string | null;
  title: string;
  description: string;
  address_text?: string | null;
  landmark?: string | null;
  location_point?: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  source: ComplaintSource;
  submitted_at: string;
  sla_due_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  citizen_satisfaction_rating?: number | null;
  citizen_feedback?: string | null;
  feedback_submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplaintWithRelations extends Complaint {
  category: ComplaintCategory | null;
  subcategory: ComplaintSubcategory | null;
  ward: Ward | null;
  department: Department | null;
  assigned_staff: {
    id: string;
    email: string;
    user_profiles: {
      full_name: string;
    } | null;
  } | null;
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  uploaded_by_user_id: string;
  file_name: string;
  file_type: string | null;
  mime_type: string;
  file_size_bytes: number | null;
  file_url: string;
  storage_path: string;
  is_public: boolean;
  uploaded_at: string;
}

export interface ComplaintStatusHistoryItem {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  note?: string | null;
  changed_by_user_id: string;
  changed_at: string;
  changed_by: {
    id: string;
    email: string;
    user_profiles: {
      full_name: string;
    } | null;
  } | null;
}

export interface CreateComplaintData {
  category_id: string;
  subcategory_id?: string;
  ward_id: string;
  title: string;
  description: string;
  address_text?: string;
  landmark?: string;
  location_point?: { lat: number; lng: number };
  attachments?: File[];
}
