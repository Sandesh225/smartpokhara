// ============================================================================
// FILE: lib/types/complaints.ts
// TypeScript types for complaint system
// ============================================================================

export type ComplaintStatus =
  | "draft"
  | "submitted"
  | "received"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected"
  | "reopened";

export type ComplaintPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent"
  | "critical";

export type AttachmentType = "photo" | "video" | "document" | "audio";

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
  received_at?: string;
  assigned_at?: string;
  in_progress_at?: string;
  resolved_at?: string;
  closed_at?: string;
  sla_due_at?: string;
  sla_breached: boolean;
  sla_breach_hours?: number;
  time_to_resolve_hours?: number;
  is_escalated: boolean;
  is_overdue: boolean;
  resolution_notes?: string;
  citizen_satisfaction_rating?: number;
  citizen_feedback?: string;
  feedback_submitted_at?: string;
  view_count: number;
  upvote_count: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintWithRelations extends Complaint {
  category?: { id: string; name: string; name_nepali?: string };
  subcategory?: { id: string; name: string; name_nepali?: string };
  ward?: {
    id: string;
    ward_number: number;
    name: string;
    name_nepali?: string;
  };
  department?: { id: string; name: string; code: string };
  assigned_staff?: Array<{
    id: string;
    email: string;
    user_profiles: { full_name: string };
  }>;
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
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  original_file_name: string;
  file_type: AttachmentType;
  mime_type: string;
  file_size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  file_url: string;
  thumbnail_url?: string;
  uploaded_by_user_id: string;
  uploaded_by_role: string;
  upload_context: string;
  is_public: boolean;
  is_evidence: boolean;
  uploaded_at: string;
  signedUrl?: string;
}

export interface ComplaintStatusHistoryItem {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus;
  new_status: ComplaintStatus;
  changed_by_user_id: string;
  changed_by_role: string;
  changed_at: string;
  note?: string;
  changed_by?: {
    id: string;
    email: string;
    user_profiles: { full_name: string };
  };
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string;
  user_role: string;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
  user?: {
    id: string;
    email: string;
    user_profiles: { full_name: string };
  };
}

export interface ComplaintFeedback {
  id: string;
  complaint_id: string;
  citizen_id: string;
  rating: number;
  feedback_text?: string;
  submitted_at: string;
}

// ============================================================================
// FILE: utils/validation.ts
// Form validation schemas using Zod
// ============================================================================

import { z } from "zod";

export const complaintSchema = z.object({
  category_id: z.string().uuid({ message: "Please select a category" }),
  subcategory_id: z.string().uuid({ message: "Please select a subcategory" }),
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
  attachments: z
    .array(z.instanceof(File))
    .max(5, "Maximum 5 files allowed")
    .optional(),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback_text: z.string().max(1000).optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
