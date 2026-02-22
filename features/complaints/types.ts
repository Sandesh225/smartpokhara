import { z } from "zod";

// ==========================================
// Zod Schemas for Validation
// ==========================================

export const ComplaintStatusSchema = z.enum([
  "pending",
  "received",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
  "rejected",
  "reopened",
  "draft"
]);

export const ComplaintPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
  "critical"
]);

export const ComplaintSourceSchema = z.enum([
  "web",
  "mobile",
  "call_center",
  "field_office",
  "email"
]);

export const complaintSchema = z.object({
  category_id: z.string().uuid({ message: "Please select a category" }),
  subcategory_id: z.string().uuid({ message: "Please select a subcategory" }).optional(),
  ward_id: z.string().uuid({ message: "Please select a ward" }),
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  address_text: z.string().max(500).optional(),
  landmark: z.string().max(200).optional(),
  is_anonymous: z.boolean(),
  phone: z.string().optional(),
  priority: ComplaintPrioritySchema,
  location_point: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()])
  }).nullable().optional(),
});

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  issue_resolved: z.boolean(),
  would_recommend: z.boolean(),
  feedback_text: z.string().max(1000).optional(),
});

// ==========================================
// TypeScript Types & Interfaces
// ==========================================

export type ComplaintStatus = z.infer<typeof ComplaintStatusSchema>;
export type ComplaintPriority = z.infer<typeof ComplaintPrioritySchema>;
export type Priority = ComplaintPriority; // Alias for legacy support
export type ComplaintSource = z.infer<typeof ComplaintSourceSchema>;


export type AttachmentType = "photo" | "video" | "document" | "audio";

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali: string | null;
  area_geometry: any;
  chairperson_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  name_nepali: string | null;
  code: string;
  description: string | null;
  head_user_id: string | null;
  is_active: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  name_nepali: string | null;
  description: string | null;
  default_department_id: string | null;
  default_sla_days: number;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintSubcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  primary_department_id: string | null;
  default_sla_days: number | null;
  keywords: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export interface Complaint {
  id: string;
  tracking_code: string;
  citizen_id: string;
  category_id: string;
  subcategory_id?: string;
  ward_id: string;
  assigned_department_id?: string;
  assigned_staff_id?: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  address_text?: string;
  landmark?: string;
  location_point?: {
    type: "Point";
    coordinates: [number, number];
  };
  submitted_at: string;
  assigned_at?: string;
  resolved_at?: string;
  closed_at?: string;
  sla_due_at?: string;
  sla_breached_at?: string;
  upvote_count: number;
  source: ComplaintSource;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  phone?: string;

  // Relations (optional/joined)
  category?: { id: string; name: string; name_nepali?: string; icon?: string; color?: string };
  subcategory?: { id: string; name: string; name_nepali?: string };
  ward?: {
    id: string;
    ward_number: number;
    name: string;
    name_nepali?: string;
  };
  department?: { id: string; name: string; code: string };
  assigned_staff?: {
    id: string;
    full_name?: string;
    email?: string;
    staff_code?: string;
    profile?: {
      full_name: string;
      avatar_url?: string;
      profile_photo_url?: string;
    };
  };
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    profile_photo_url?: string;
  };
  citizen?: {
    id: string;
    email?: string;
    phone?: string;
    profile?: {
      full_name: string;
      profile_photo_url?: string;
    };
    author?: {
      full_name: string;
      profile_photo_url?: string;
    };
  };
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_path: string;
  file_type: AttachmentType | string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_by_role?: string;
  is_public: boolean;
  created_at: string;

  thumbnail_url?: string;
  mime_type?: string;
  file_size_bytes?: number;
  uploaded_at?: string;
  file_url?: string;
}


export interface ComplaintComment {
  id: string;
  complaint_id: string;
  author_id: string;
  author_role: string;
  content: string;
  comment_text?: string; // Legacy support
  is_internal: boolean;
  created_at: string;
  author?: {
    id: string;
    email?: string;
    profile?: {
      full_name: string;
      profile_photo_url?: string;
      avatar_url?: string;
    };
  };
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  old_status?: ComplaintStatus;
  new_status: ComplaintStatus;
  changed_by?: string;
  changed_by_role?: string;
  note?: string;
  created_at: string;
  changed_by_user?: {
    profile?: {
      full_name: string;
    };
  };
}

export type ComplaintStatusHistoryItem = ComplaintStatusHistory;

export interface ComplaintFilters {
  search?: string;
  status?: ComplaintStatus[];
  priority?: ComplaintPriority[];
  ward_id?: string;
  category_id?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface CreateComplaintData {
  title: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  ward_id: string;
  location_point?: unknown;
  address_text?: string;
  landmark?: string;
  is_anonymous?: boolean;
  phone?: string;
  media?: File[];
  source?: ComplaintSource;
}

export interface SubmitComplaintResponse {
  success: boolean;
  complaint_id: string;
  tracking_code: string;
  message: string;
}

export interface ComplaintStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

export interface SupervisorJurisdiction {
  assigned_wards: string[];
  assigned_departments: string[];
  is_senior: boolean;
}

export type ComplaintFormData = z.infer<typeof complaintSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;

