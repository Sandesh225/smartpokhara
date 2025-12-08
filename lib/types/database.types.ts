// lib/supabase/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      complaints: {
        Row: {
          id: string;
          tracking_code: string;
          citizen_id: string;
          citizen_full_name: string;
          citizen_phone: string | null;
          citizen_email: string | null;
          title: string;
          description: string;
          category_id: string;
          subcategory_id: string | null;
          ward_id: string;
          location_point: any;
          address_text: string | null;
          landmark: string | null;
          latitude: number | null;
          longitude: number | null;
          status:
            | "received"
            | "under_review"
            | "assigned"
            | "in_progress"
            | "resolved"
            | "closed"
            | "rejected"
            | "reopened";
          priority: "critical" | "urgent" | "high" | "medium" | "low";
          is_anonymous: boolean;
          source: "web" | "mobile" | "call_center" | "field_office" | "email";
          assigned_department_id: string | null;
          assigned_staff_id: string | null;
          assigned_at: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_notes: string | null;
          sla_due_at: string | null;
          sla_breached_at: string | null;
          actual_resolution_days: number | null;
          upvote_count: number;
          comment_count: number;
          attachment_count: number;
          submitted_at: string;
          acknowledged_at: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          tracking_code: string;
          citizen_id: string;
          citizen_full_name?: string;
          citizen_phone?: string | null;
          citizen_email?: string | null;
          title: string;
          description: string;
          category_id: string;
          subcategory_id?: string | null;
          ward_id: string;
          location_point?: any;
          address_text?: string | null;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?:
            | "received"
            | "under_review"
            | "assigned"
            | "in_progress"
            | "resolved"
            | "closed"
            | "rejected"
            | "reopened";
          priority?: "critical" | "urgent" | "high" | "medium" | "low";
          is_anonymous?: boolean;
          source?: "web" | "mobile" | "call_center" | "field_office" | "email";
          assigned_department_id?: string | null;
          assigned_staff_id?: string | null;
          assigned_at?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_notes?: string | null;
          sla_due_at?: string | null;
          sla_breached_at?: string | null;
          actual_resolution_days?: number | null;
          upvote_count?: number;
          comment_count?: number;
          attachment_count?: number;
          submitted_at?: string;
          acknowledged_at?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          tracking_code?: string;
          citizen_id?: string;
          citizen_full_name?: string;
          citizen_phone?: string | null;
          citizen_email?: string | null;
          title?: string;
          description?: string;
          category_id?: string;
          subcategory_id?: string | null;
          ward_id?: string;
          location_point?: any;
          address_text?: string | null;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?:
            | "received"
            | "under_review"
            | "assigned"
            | "in_progress"
            | "resolved"
            | "closed"
            | "rejected"
            | "reopened";
          priority?: "critical" | "urgent" | "high" | "medium" | "low";
          is_anonymous?: boolean;
          source?: "web" | "mobile" | "call_center" | "field_office" | "email";
          assigned_department_id?: string | null;
          assigned_staff_id?: string | null;
          assigned_at?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_notes?: string | null;
          sla_due_at?: string | null;
          sla_breached_at?: string | null;
          actual_resolution_days?: number | null;
          upvote_count?: number;
          comment_count?: number;
          attachment_count?: number;
          submitted_at?: string;
          acknowledged_at?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
      };
      // Add other table definitions as needed
    };
    Views: {};
    Functions: {
      rpc_submit_complaint: {
        Args: {
          p_title: string;
          p_description: string;
          p_category_id: string;
          p_subcategory_id?: string;
          p_ward_id: string;
          p_location_point?: Json;
          p_address_text?: string;
          p_landmark?: string;
          p_priority?: "critical" | "urgent" | "high" | "medium" | "low";
          p_is_anonymous?: boolean;
          p_phone?: string;
          p_source?:
            | "web"
            | "mobile"
            | "call_center"
            | "field_office"
            | "email";
        };
        Returns: Json;
      };
      rpc_search_complaints: {
        Args: {
          p_search_term?: string;
          p_status?: string[];
          p_priority?: string[];
          p_category_id?: string;
          p_ward_id?: string;
          p_date_from?: string;
          p_date_to?: string;
          p_is_overdue?: boolean;
          p_sort_by?: string;
          p_sort_order?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Json;
      };
      // Add other function definitions
    };
    Enums: {
      complaint_status:
        | "received"
        | "under_review"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "closed"
        | "rejected"
        | "reopened";
      complaint_priority: "critical" | "urgent" | "high" | "medium" | "low";
      complaint_source:
        | "web"
        | "mobile"
        | "call_center"
        | "field_office"
        | "email";
      notification_type:
        | "complaint_status"
        | "complaint_assigned"
        | "comment_added"
        | "new_notice"
        | "bill_generated"
        | "payment_success"
        | "system_announcement";
    };
  };
}
