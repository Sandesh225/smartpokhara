export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance_logs: {
        Row: {
          check_in_device_id: string | null
          check_in_location: unknown
          check_in_time: string | null
          check_out_location: unknown
          check_out_time: string | null
          created_at: string | null
          date: string
          id: string
          is_verified: boolean | null
          notes: string | null
          staff_id: string
          status: Database["public"]["Enums"]["attendance_status"] | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          check_in_device_id?: string | null
          check_in_location?: unknown
          check_in_time?: string | null
          check_out_location?: unknown
          check_out_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          staff_id: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          check_in_device_id?: string | null
          check_in_location?: unknown
          check_in_time?: string | null
          check_out_location?: unknown
          check_out_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          staff_id?: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          base_amount: number
          bill_number: string
          bill_type: Database["public"]["Enums"]["bill_type"]
          business_license_number: string | null
          citizen_id: string
          created_at: string
          description: string | null
          discount_amount: number | null
          due_date: string
          generated_date: string
          id: string
          is_overdue: boolean | null
          late_fee_amount: number | null
          paid_date: string | null
          period_end: string | null
          period_start: string | null
          property_id: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          base_amount: number
          bill_number: string
          bill_type: Database["public"]["Enums"]["bill_type"]
          business_license_number?: string | null
          citizen_id: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          due_date: string
          generated_date?: string
          id?: string
          is_overdue?: boolean | null
          late_fee_amount?: number | null
          paid_date?: string | null
          period_end?: string | null
          period_start?: string | null
          property_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          base_amount?: number
          bill_number?: string
          bill_type?: Database["public"]["Enums"]["bill_type"]
          business_license_number?: string | null
          citizen_id?: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          due_date?: string
          generated_date?: string
          id?: string
          is_overdue?: boolean | null
          late_fee_amount?: number | null
          paid_date?: string | null
          period_end?: string | null
          period_start?: string | null
          property_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_cycles: {
        Row: {
          concluding_message: string | null
          created_at: string | null
          description: string | null
          finalized_at: string | null
          id: string
          is_active: boolean | null
          max_project_cost: number | null
          max_votes_per_user: number | null
          min_project_cost: number | null
          submission_end_at: string
          submission_start_at: string
          title: string
          total_budget_amount: number
          updated_at: string | null
          voting_end_at: string
          voting_start_at: string
        }
        Insert: {
          concluding_message?: string | null
          created_at?: string | null
          description?: string | null
          finalized_at?: string | null
          id?: string
          is_active?: boolean | null
          max_project_cost?: number | null
          max_votes_per_user?: number | null
          min_project_cost?: number | null
          submission_end_at: string
          submission_start_at: string
          title: string
          total_budget_amount: number
          updated_at?: string | null
          voting_end_at: string
          voting_start_at: string
        }
        Update: {
          concluding_message?: string | null
          created_at?: string | null
          description?: string | null
          finalized_at?: string | null
          id?: string
          is_active?: boolean | null
          max_project_cost?: number | null
          max_votes_per_user?: number | null
          min_project_cost?: number | null
          submission_end_at?: string
          submission_start_at?: string
          title?: string
          total_budget_amount?: number
          updated_at?: string | null
          voting_end_at?: string
          voting_start_at?: string
        }
        Relationships: []
      }
      budget_proposals: {
        Row: {
          address_text: string | null
          admin_notes: string | null
          author_id: string
          category: Database["public"]["Enums"]["proposal_category"]
          cover_image_url: string | null
          created_at: string | null
          cycle_id: string
          department_id: string | null
          description: string
          estimated_cost: number
          id: string
          location_point: unknown
          status: Database["public"]["Enums"]["proposal_status"] | null
          technical_cost: number | null
          title: string
          updated_at: string | null
          vote_count: number | null
          ward_id: string | null
        }
        Insert: {
          address_text?: string | null
          admin_notes?: string | null
          author_id: string
          category: Database["public"]["Enums"]["proposal_category"]
          cover_image_url?: string | null
          created_at?: string | null
          cycle_id: string
          department_id?: string | null
          description: string
          estimated_cost: number
          id?: string
          location_point?: unknown
          status?: Database["public"]["Enums"]["proposal_status"] | null
          technical_cost?: number | null
          title: string
          updated_at?: string | null
          vote_count?: number | null
          ward_id?: string | null
        }
        Update: {
          address_text?: string | null
          admin_notes?: string | null
          author_id?: string
          category?: Database["public"]["Enums"]["proposal_category"]
          cover_image_url?: string | null
          created_at?: string | null
          cycle_id?: string
          department_id?: string | null
          description?: string
          estimated_cost?: number
          id?: string
          location_point?: unknown
          status?: Database["public"]["Enums"]["proposal_status"] | null
          technical_cost?: number | null
          title?: string
          updated_at?: string | null
          vote_count?: number | null
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_proposals_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_proposals_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "budget_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_proposals_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_proposals_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_votes: {
        Row: {
          cycle_id: string
          id: string
          proposal_id: string
          voted_at: string | null
          voter_id: string
        }
        Insert: {
          cycle_id: string
          id?: string
          proposal_id: string
          voted_at?: string | null
          voter_id: string
        }
        Update: {
          cycle_id?: string
          id?: string
          proposal_id?: string
          voted_at?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_votes_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "budget_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "budget_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_assignment_history: {
        Row: {
          assigned_by: string
          assigned_to: string
          assignment_notes: string | null
          complaint_id: string
          created_at: string
          id: string
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          assignment_notes?: string | null
          complaint_id: string
          created_at?: string
          id?: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          assignment_notes?: string | null
          complaint_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_assignment_history_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_assignment_history_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_assignment_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_attachments: {
        Row: {
          complaint_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_public: boolean | null
          thumbnail_url: string | null
          uploaded_by: string | null
          uploaded_by_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          complaint_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          uploaded_by?: string | null
          uploaded_by_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          complaint_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          uploaded_by?: string | null
          uploaded_by_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_attachments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_categories: {
        Row: {
          color: string | null
          created_at: string
          default_department_id: string | null
          default_sla_days: number | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          default_department_id?: string | null
          default_sla_days?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          default_department_id?: string | null
          default_sla_days?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_categories_default_department_id_fkey"
            columns: ["default_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_comments: {
        Row: {
          attachments: Json | null
          author_id: string
          author_role: Database["public"]["Enums"]["user_role"]
          complaint_id: string
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          author_role: Database["public"]["Enums"]["user_role"]
          complaint_id: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          author_role?: Database["public"]["Enums"]["user_role"]
          complaint_id?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_comments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_feedback: {
        Row: {
          citizen_id: string
          complaint_id: string
          created_at: string
          feedback_text: string | null
          id: string
          issue_fully_resolved: boolean | null
          rating: number | null
          resolution_speed_rating: number | null
          satisfaction_level: number | null
          staff_professionalism_rating: number | null
          staff_responsiveness_rating: number | null
          updated_at: string
          would_recommend: boolean | null
        }
        Insert: {
          citizen_id: string
          complaint_id: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          issue_fully_resolved?: boolean | null
          rating?: number | null
          resolution_speed_rating?: number | null
          satisfaction_level?: number | null
          staff_professionalism_rating?: number | null
          staff_responsiveness_rating?: number | null
          updated_at?: string
          would_recommend?: boolean | null
        }
        Update: {
          citizen_id?: string
          complaint_id?: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          issue_fully_resolved?: boolean | null
          rating?: number | null
          resolution_speed_rating?: number | null
          satisfaction_level?: number | null
          staff_professionalism_rating?: number | null
          staff_responsiveness_rating?: number | null
          updated_at?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_feedback_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_feedback_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: true
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_status_history: {
        Row: {
          changed_by: string | null
          changed_by_role: Database["public"]["Enums"]["user_role"] | null
          complaint_id: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["complaint_status"]
          note: string | null
          old_status: Database["public"]["Enums"]["complaint_status"] | null
        }
        Insert: {
          changed_by?: string | null
          changed_by_role?: Database["public"]["Enums"]["user_role"] | null
          complaint_id: string
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["complaint_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["complaint_status"] | null
        }
        Update: {
          changed_by?: string | null
          changed_by_role?: Database["public"]["Enums"]["user_role"] | null
          complaint_id?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["complaint_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["complaint_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_status_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_subcategories: {
        Row: {
          category_id: string
          created_at: string
          default_sla_days: number | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          keywords: string[] | null
          name: string
          primary_department_id: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          default_sla_days?: number | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          name: string
          primary_department_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          default_sla_days?: number | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          name?: string
          primary_department_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_subcategories_primary_department_id_fkey"
            columns: ["primary_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          acknowledged_at: string | null
          actual_resolution_days: number | null
          address_text: string | null
          assigned_at: string | null
          assigned_department_id: string | null
          assigned_staff_id: string | null
          attachment_count: number | null
          category_id: string
          citizen_email: string | null
          citizen_full_name: string | null
          citizen_id: string
          citizen_phone: string | null
          closed_at: string | null
          comment_count: number | null
          created_at: string
          description: string
          id: string
          is_anonymous: boolean | null
          landmark: string | null
          latitude: number | null
          location_point: unknown
          longitude: number | null
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          sla_breached_at: string | null
          sla_due_at: string | null
          source: Database["public"]["Enums"]["complaint_source"]
          status: Database["public"]["Enums"]["complaint_status"]
          subcategory_id: string | null
          submitted_at: string
          title: string
          tracking_code: string
          updated_at: string
          upvote_count: number | null
          ward_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          actual_resolution_days?: number | null
          address_text?: string | null
          assigned_at?: string | null
          assigned_department_id?: string | null
          assigned_staff_id?: string | null
          attachment_count?: number | null
          category_id: string
          citizen_email?: string | null
          citizen_full_name?: string | null
          citizen_id: string
          citizen_phone?: string | null
          closed_at?: string | null
          comment_count?: number | null
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean | null
          landmark?: string | null
          latitude?: number | null
          location_point?: unknown
          longitude?: number | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sla_breached_at?: string | null
          sla_due_at?: string | null
          source?: Database["public"]["Enums"]["complaint_source"]
          status?: Database["public"]["Enums"]["complaint_status"]
          subcategory_id?: string | null
          submitted_at?: string
          title: string
          tracking_code: string
          updated_at?: string
          upvote_count?: number | null
          ward_id: string
        }
        Update: {
          acknowledged_at?: string | null
          actual_resolution_days?: number | null
          address_text?: string | null
          assigned_at?: string | null
          assigned_department_id?: string | null
          assigned_staff_id?: string | null
          attachment_count?: number | null
          category_id?: string
          citizen_email?: string | null
          citizen_full_name?: string | null
          citizen_id?: string
          citizen_phone?: string | null
          closed_at?: string | null
          comment_count?: number | null
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean | null
          landmark?: string | null
          latitude?: number | null
          location_point?: unknown
          longitude?: number | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sla_breached_at?: string | null
          sla_due_at?: string | null
          source?: Database["public"]["Enums"]["complaint_source"]
          status?: Database["public"]["Enums"]["complaint_status"]
          subcategory_id?: string | null
          submitted_at?: string
          title?: string
          tracking_code?: string
          updated_at?: string
          upvote_count?: number | null
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_department_id_fkey"
            columns: ["assigned_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_assigned_staff_profile_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "complaint_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assigned_staff_profile"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "mv_staff_performance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_assigned_staff_profile"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          head_user_id: string | null
          id: string
          is_active: boolean
          name: string
          name_nepali: string | null
          updated_at: string
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_nepali?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_nepali?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_user_id_fkey"
            columns: ["head_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      escalations: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          actual_response_at: string | null
          attachments: string[] | null
          complaint_id: string
          context_notes: string | null
          created_at: string
          escalated_by: string
          escalated_to: Database["public"]["Enums"]["escalation_target"]
          expected_response_at: string | null
          id: string
          reason: string
          requested_action: string | null
          requested_deadline: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          target_department_id: string | null
          target_external_agency: string | null
          target_user_id: string | null
          updated_at: string
          urgency_level: Database["public"]["Enums"]["complaint_priority"]
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_response_at?: string | null
          attachments?: string[] | null
          complaint_id: string
          context_notes?: string | null
          created_at?: string
          escalated_by: string
          escalated_to: Database["public"]["Enums"]["escalation_target"]
          expected_response_at?: string | null
          id?: string
          reason: string
          requested_action?: string | null
          requested_deadline?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          target_department_id?: string | null
          target_external_agency?: string | null
          target_user_id?: string | null
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["complaint_priority"]
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_response_at?: string | null
          attachments?: string[] | null
          complaint_id?: string
          context_notes?: string | null
          created_at?: string
          escalated_by?: string
          escalated_to?: Database["public"]["Enums"]["escalation_target"]
          expected_response_at?: string | null
          id?: string
          reason?: string
          requested_action?: string | null
          requested_deadline?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          target_department_id?: string | null
          target_external_agency?: string | null
          target_user_id?: string | null
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["complaint_priority"]
        }
        Relationships: [
          {
            foreignKeyName: "escalations_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_escalated_by_fkey"
            columns: ["escalated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          complaint_id: string | null
          content: string
          created_at: string
          id: string
          is_private: boolean | null
          note_type: string | null
          shared_with_admin: boolean | null
          shared_with_supervisors: string[] | null
          staff_id: string | null
          supervisor_id: string
          tags: string[] | null
          task_id: string | null
          updated_at: string
        }
        Insert: {
          complaint_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          shared_with_admin?: boolean | null
          shared_with_supervisors?: string[] | null
          staff_id?: string | null
          supervisor_id: string
          tags?: string[] | null
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          complaint_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          shared_with_admin?: boolean | null
          shared_with_supervisors?: string[] | null
          staff_id?: string | null
          supervisor_id?: string
          tags?: string[] | null
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "mv_staff_performance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "internal_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "internal_notes_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "supervisor_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          annual_allowed: number | null
          annual_used: number | null
          casual_allowed: number | null
          casual_used: number | null
          id: string
          last_reset: string | null
          sick_allowed: number | null
          sick_used: number | null
          staff_id: string
        }
        Insert: {
          annual_allowed?: number | null
          annual_used?: number | null
          casual_allowed?: number | null
          casual_used?: number | null
          id?: string
          last_reset?: string | null
          sick_allowed?: number | null
          sick_used?: number | null
          staff_id: string
        }
        Update: {
          annual_allowed?: number | null
          annual_used?: number | null
          casual_allowed?: number | null
          casual_used?: number | null
          id?: string
          last_reset?: string | null
          sick_allowed?: number | null
          sick_used?: number | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          reason: string
          staff_id: string
          start_date: string
          status: Database["public"]["Enums"]["leave_status"] | null
          type: Database["public"]["Enums"]["leave_type"]
          updated_at: string | null
        }
        Insert: {
          approval_notes?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          reason: string
          staff_id: string
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          type: Database["public"]["Enums"]["leave_type"]
          updated_at?: string | null
        }
        Update: {
          approval_notes?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          reason?: string
          staff_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          type?: Database["public"]["Enums"]["leave_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1?: string
          participant_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          notice_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notice_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_attachments_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          expires_at: string | null
          id: string
          is_public: boolean
          is_urgent: boolean | null
          notice_type: string
          published_at: string
          title: string
          updated_at: string
          ward_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean
          is_urgent?: boolean | null
          notice_type: string
          published_at?: string
          title: string
          updated_at?: string
          ward_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean
          is_urgent?: boolean | null
          notice_type?: string
          published_at?: string
          title?: string
          updated_at?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          bill_id: string | null
          complaint_id: string | null
          created_at: string
          delivery_method: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_delivered: boolean | null
          is_read: boolean | null
          message: string
          notice_id: string | null
          priority: Database["public"]["Enums"]["complaint_priority"] | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          bill_id?: string | null
          complaint_id?: string | null
          created_at?: string
          delivery_method?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean | null
          message: string
          notice_id?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          bill_id?: string | null
          complaint_id?: string | null
          created_at?: string
          delivery_method?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_delivered?: boolean | null
          is_read?: boolean | null
          message?: string
          notice_id?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number
          bill_id: string
          citizen_id: string
          created_at: string
          failure_reason: string | null
          gateway_fee: number | null
          gateway_reference: string | null
          gateway_response: Json | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_generated_at: string | null
          receipt_number: string | null
          receipt_path: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid: number
          bill_id: string
          citizen_id: string
          created_at?: string
          failure_reason?: string | null
          gateway_fee?: number | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_generated_at?: string | null
          receipt_number?: string | null
          receipt_path?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          bill_id?: string
          citizen_id?: string
          created_at?: string
          failure_reason?: string | null
          gateway_fee?: number | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_generated_at?: string | null
          receipt_number?: string | null
          receipt_path?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          permissions: Json | null
          role_type: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          permissions?: Json | null
          role_type: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          permissions?: Json | null
          role_type?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          action: string
          created_at: string
          failure_reason: string | null
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          availability_status:
            | Database["public"]["Enums"]["staff_availability_status"]
            | null
          created_at: string
          current_workload: number | null
          department_id: string | null
          employment_date: string | null
          id: string
          is_active: boolean
          is_supervisor: boolean
          last_known_location: unknown
          max_concurrent_assignments: number | null
          metadata: Json | null
          performance_rating: number | null
          specializations: string[] | null
          staff_code: string | null
          staff_role: Database["public"]["Enums"]["user_role"]
          termination_date: string | null
          updated_at: string
          user_id: string
          ward_id: string | null
        }
        Insert: {
          availability_status?:
            | Database["public"]["Enums"]["staff_availability_status"]
            | null
          created_at?: string
          current_workload?: number | null
          department_id?: string | null
          employment_date?: string | null
          id?: string
          is_active?: boolean
          is_supervisor?: boolean
          last_known_location?: unknown
          max_concurrent_assignments?: number | null
          metadata?: Json | null
          performance_rating?: number | null
          specializations?: string[] | null
          staff_code?: string | null
          staff_role: Database["public"]["Enums"]["user_role"]
          termination_date?: string | null
          updated_at?: string
          user_id: string
          ward_id?: string | null
        }
        Update: {
          availability_status?:
            | Database["public"]["Enums"]["staff_availability_status"]
            | null
          created_at?: string
          current_workload?: number | null
          department_id?: string | null
          employment_date?: string | null
          id?: string
          is_active?: boolean
          is_supervisor?: boolean
          last_known_location?: unknown
          max_concurrent_assignments?: number | null
          metadata?: Json | null
          performance_rating?: number | null
          specializations?: string[] | null
          staff_code?: string | null
          staff_role?: Database["public"]["Enums"]["user_role"]
          termination_date?: string | null
          updated_at?: string
          user_id?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "staff_profiles_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_staff_link_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      staff_work_assignments: {
        Row: {
          actual_hours: number | null
          approved_at: string | null
          assigned_at: string
          assigned_by: string | null
          assignment_notes: string | null
          assignment_status: Database["public"]["Enums"]["task_execution_status"]
          checklist_items_completed: number | null
          citizen_id: string | null
          complaint_id: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          due_at: string
          estimated_hours: number | null
          id: string
          priority: Database["public"]["Enums"]["complaint_priority"]
          required_materials: string[] | null
          required_skills: string[] | null
          special_instructions: string | null
          staff_id: string
          started_at: string | null
          task_id: string | null
          total_checklist_items: number | null
          travel_distance_km: number | null
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          approved_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          assignment_notes?: string | null
          assignment_status?: Database["public"]["Enums"]["task_execution_status"]
          checklist_items_completed?: number | null
          citizen_id?: string | null
          complaint_id?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          due_at: string
          estimated_hours?: number | null
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          required_materials?: string[] | null
          required_skills?: string[] | null
          special_instructions?: string | null
          staff_id: string
          started_at?: string | null
          task_id?: string | null
          total_checklist_items?: number | null
          travel_distance_km?: number | null
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          approved_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          assignment_notes?: string | null
          assignment_status?: Database["public"]["Enums"]["task_execution_status"]
          checklist_items_completed?: number | null
          citizen_id?: string | null
          complaint_id?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          due_at?: string
          estimated_hours?: number | null
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          required_materials?: string[] | null
          required_skills?: string[] | null
          special_instructions?: string | null
          staff_id?: string
          started_at?: string | null
          task_id?: string | null
          total_checklist_items?: number | null
          travel_distance_km?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_work_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_work_assignments_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_work_assignments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_work_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_work_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "supervisor_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_work_logs: {
        Row: {
          assignment_id: string | null
          complaint_id: string | null
          created_at: string
          description: string | null
          document_urls: string[] | null
          end_time: string | null
          equipment_used: string[] | null
          id: string
          is_internal: boolean | null
          is_public: boolean | null
          issues_encountered: string | null
          issues_resolved: boolean | null
          latitude: number | null
          location_accuracy_meters: number | null
          location_address: string | null
          location_point: unknown
          log_type: Database["public"]["Enums"]["work_log_type"]
          longitude: number | null
          materials_used: Json | null
          new_status:
            | Database["public"]["Enums"]["task_execution_status"]
            | null
          old_status:
            | Database["public"]["Enums"]["task_execution_status"]
            | null
          photo_urls: string[] | null
          staff_id: string
          start_time: string | null
          status_snapshot: string | null
          task_id: string | null
          time_spent_minutes: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          complaint_id?: string | null
          created_at?: string
          description?: string | null
          document_urls?: string[] | null
          end_time?: string | null
          equipment_used?: string[] | null
          id?: string
          is_internal?: boolean | null
          is_public?: boolean | null
          issues_encountered?: string | null
          issues_resolved?: boolean | null
          latitude?: number | null
          location_accuracy_meters?: number | null
          location_address?: string | null
          location_point?: unknown
          log_type?: Database["public"]["Enums"]["work_log_type"]
          longitude?: number | null
          materials_used?: Json | null
          new_status?:
            | Database["public"]["Enums"]["task_execution_status"]
            | null
          old_status?:
            | Database["public"]["Enums"]["task_execution_status"]
            | null
          photo_urls?: string[] | null
          staff_id: string
          start_time?: string | null
          status_snapshot?: string | null
          task_id?: string | null
          time_spent_minutes?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          complaint_id?: string | null
          created_at?: string
          description?: string | null
          document_urls?: string[] | null
          end_time?: string | null
          equipment_used?: string[] | null
          id?: string
          is_internal?: boolean | null
          is_public?: boolean | null
          issues_encountered?: string | null
          issues_resolved?: boolean | null
          latitude?: number | null
          location_accuracy_meters?: number | null
          location_address?: string | null
          location_point?: unknown
          log_type?: Database["public"]["Enums"]["work_log_type"]
          longitude?: number | null
          materials_used?: Json | null
          new_status?:
            | Database["public"]["Enums"]["task_execution_status"]
            | null
          old_status?:
            | Database["public"]["Enums"]["task_execution_status"]
            | null
          photo_urls?: string[] | null
          staff_id?: string
          start_time?: string | null
          status_snapshot?: string | null
          task_id?: string | null
          time_spent_minutes?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_work_logs_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "staff_work_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_work_logs_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_work_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_work_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "supervisor_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisor_profiles: {
        Row: {
          assigned_departments: string[] | null
          assigned_wards: string[] | null
          can_approve_leave: boolean | null
          can_assign_staff: boolean | null
          can_close_complaints: boolean | null
          can_create_tasks: boolean | null
          can_escalate: boolean | null
          can_generate_reports: boolean | null
          created_at: string
          current_team_size: number | null
          dashboard_preferences: Json | null
          id: string
          last_known_location: unknown
          max_team_size: number | null
          notification_preferences: Json | null
          supervisor_level: Database["public"]["Enums"]["supervisor_level"]
          target_citizen_satisfaction: number | null
          target_resolution_rate: number | null
          target_sla_compliance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_departments?: string[] | null
          assigned_wards?: string[] | null
          can_approve_leave?: boolean | null
          can_assign_staff?: boolean | null
          can_close_complaints?: boolean | null
          can_create_tasks?: boolean | null
          can_escalate?: boolean | null
          can_generate_reports?: boolean | null
          created_at?: string
          current_team_size?: number | null
          dashboard_preferences?: Json | null
          id?: string
          last_known_location?: unknown
          max_team_size?: number | null
          notification_preferences?: Json | null
          supervisor_level?: Database["public"]["Enums"]["supervisor_level"]
          target_citizen_satisfaction?: number | null
          target_resolution_rate?: number | null
          target_sla_compliance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_departments?: string[] | null
          assigned_wards?: string[] | null
          can_approve_leave?: boolean | null
          can_assign_staff?: boolean | null
          can_close_complaints?: boolean | null
          can_create_tasks?: boolean | null
          can_escalate?: boolean | null
          can_generate_reports?: boolean | null
          created_at?: string
          current_team_size?: number | null
          dashboard_preferences?: Json | null
          id?: string
          last_known_location?: unknown
          max_team_size?: number | null
          notification_preferences?: Json | null
          supervisor_level?: Database["public"]["Enums"]["supervisor_level"]
          target_citizen_satisfaction?: number | null
          target_resolution_rate?: number | null
          target_sla_compliance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisor_staff_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_notes: string | null
          created_at: string
          deactivated_at: string | null
          deactivation_reason: string | null
          id: string
          is_active: boolean | null
          staff_id: string
          supervisor_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_notes?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivation_reason?: string | null
          id?: string
          is_active?: boolean | null
          staff_id: string
          supervisor_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_notes?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivation_reason?: string | null
          id?: string
          is_active?: boolean | null
          staff_id?: string
          supervisor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_staff_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "mv_staff_performance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "supervisor_staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "supervisor_staff_assignments_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "supervisor_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      supervisor_staff_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_text: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_staff_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "message_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_staff_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisor_tasks: {
        Row: {
          actual_hours: number | null
          address_text: string | null
          approved_at: string | null
          approved_by: string | null
          assigned_to: string[] | null
          budget_allocated: number | null
          budget_spent: number | null
          completed_at: string | null
          completed_by: string | null
          completion_attachments: string[] | null
          completion_notes: string | null
          completion_percentage: number | null
          created_at: string
          description: string
          due_date: string
          estimated_hours: number | null
          id: string
          is_recurring: boolean | null
          location_point: unknown
          primary_assigned_to: string | null
          priority: Database["public"]["Enums"]["complaint_priority"]
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          required_equipment: string[] | null
          required_materials: string[] | null
          requires_approval: boolean | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          supervisor_id: string
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          tracking_code: string
          updated_at: string
          ward_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          address_text?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string[] | null
          budget_allocated?: number | null
          budget_spent?: number | null
          completed_at?: string | null
          completed_by?: string | null
          completion_attachments?: string[] | null
          completion_notes?: string | null
          completion_percentage?: number | null
          created_at?: string
          description: string
          due_date: string
          estimated_hours?: number | null
          id?: string
          is_recurring?: boolean | null
          location_point?: unknown
          primary_assigned_to?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          required_equipment?: string[] | null
          required_materials?: string[] | null
          requires_approval?: boolean | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          supervisor_id: string
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          tracking_code: string
          updated_at?: string
          ward_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          address_text?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string[] | null
          budget_allocated?: number | null
          budget_spent?: number | null
          completed_at?: string | null
          completed_by?: string | null
          completion_attachments?: string[] | null
          completion_notes?: string | null
          completion_percentage?: number | null
          created_at?: string
          description?: string
          due_date?: string
          estimated_hours?: number | null
          id?: string
          is_recurring?: boolean | null
          location_point?: unknown
          primary_assigned_to?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          required_equipment?: string[] | null
          required_materials?: string[] | null
          requires_approval?: boolean | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          supervisor_id?: string
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          tracking_code?: string
          updated_at?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_tasks_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_tasks_primary_assigned_to_fkey"
            columns: ["primary_assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_tasks_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_tasks_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          citizenship_number: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          full_name_nepali: string | null
          gender: string | null
          id: string
          landmark: string | null
          language_preference: string | null
          notification_preferences: Json | null
          profile_photo_url: string | null
          updated_at: string
          user_id: string
          ward_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          citizenship_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          full_name_nepali?: string | null
          gender?: string | null
          id?: string
          landmark?: string | null
          language_preference?: string | null
          notification_preferences?: Json | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id: string
          ward_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          citizenship_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          full_name_nepali?: string | null
          gender?: string | null
          id?: string
          landmark?: string | null
          language_preference?: string | null
          notification_preferences?: Json | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_primary: boolean
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_primary?: boolean
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_primary?: boolean
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          email_verified_at: string | null
          external_auth_provider: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          last_login_at: string | null
          locked_until: string | null
          login_attempts: number | null
          phone: string | null
          phone_verified_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verified_at?: string | null
          external_auth_provider?: string | null
          id: string
          is_active?: boolean
          is_verified?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          phone?: string | null
          phone_verified_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified_at?: string | null
          external_auth_provider?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          phone?: string | null
          phone_verified_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      v_staff_id: {
        Row: {
          user_id: string | null
        }
        Insert: {
          user_id?: string | null
        }
        Update: {
          user_id?: string | null
        }
        Relationships: []
      }
      wards: {
        Row: {
          area_geometry: unknown
          chairperson_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_nepali: string | null
          updated_at: string
          ward_number: number
        }
        Insert: {
          area_geometry?: unknown
          chairperson_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_nepali?: string | null
          updated_at?: string
          ward_number: number
        }
        Update: {
          area_geometry?: unknown
          chairperson_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_nepali?: string | null
          updated_at?: string
          ward_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      mv_staff_performance: {
        Row: {
          avg_assignment_hours: number | null
          avg_rating: number | null
          current_workload: number | null
          full_name: string | null
          on_time_resolutions: number | null
          resolved_complaints: number | null
          staff_role: Database["public"]["Enums"]["user_role"] | null
          total_complaints: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_profiles_staff_link_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      staff_attendance_logs: {
        Row: {
          check_in_device_id: string | null
          check_in_location: unknown
          check_in_time: string | null
          check_out_location: unknown
          check_out_time: string | null
          created_at: string | null
          date: string | null
          id: string | null
          is_verified: boolean | null
          notes: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          check_in_device_id?: string | null
          check_in_location?: unknown
          check_in_time?: string | null
          check_out_location?: unknown
          check_out_time?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          is_verified?: boolean | null
          notes?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          check_in_device_id?: string | null
          check_in_location?: unknown
          check_in_time?: string | null
          check_out_location?: unknown
          check_out_time?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          is_verified?: boolean | null
          notes?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      auto_assign_complaint: {
        Args: { p_complaint_id: string }
        Returns: undefined
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      fn_current_user_id: { Args: never; Returns: string }
      fn_get_default_portal: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["portal_type"]
      }
      fn_get_primary_role: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      fn_has_role: {
        Args: {
          p_role_type: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      fn_is_admin: { Args: never; Returns: boolean }
      fn_is_staff: { Args: never; Returns: boolean }
      generate_tracking_code: { Args: never; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_supervisor_complaint_counts: {
        Args: { p_supervisor_id: string }
        Returns: Json
      }
      get_supervisor_jurisdiction: {
        Args: never
        Returns: {
          assigned_departments: string[]
          assigned_wards: string[]
          is_senior: boolean
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      now_utc: { Args: never; Returns: string }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      rpc_add_complaint_comment_v2: {
        Args: {
          p_complaint_id: string
          p_content: string
          p_is_internal?: boolean
        }
        Returns: Json
      }
      rpc_admin_get_all_dept_metrics: { Args: never; Returns: Json }
      rpc_admin_get_dept_workload: { Args: never; Returns: Json }
      rpc_admin_get_metrics: { Args: never; Returns: Json }
      rpc_admin_get_status_dist: { Args: never; Returns: Json }
      rpc_admin_get_trends: { Args: { p_range?: string }; Returns: Json }
      rpc_admin_get_ward_stats: { Args: never; Returns: Json }
      rpc_assign_complaint_to_staff: {
        Args: { p_complaint_id: string; p_notes?: string; p_staff_id: string }
        Returns: Json
      }
      rpc_bulk_update_complaints: {
        Args: {
          p_complaint_ids: string[]
          p_notes?: string
          p_status: Database["public"]["Enums"]["complaint_status"]
        }
        Returns: Json
      }
      rpc_complete_assignment: {
        Args: {
          p_assignment_id: string
          p_materials_used?: Json
          p_photos?: string[]
          p_resolution_notes: string
        }
        Returns: Json
      }
      rpc_get_complaint_comments: {
        Args: { p_complaint_id: string }
        Returns: Json
      }
      rpc_get_current_user: { Args: never; Returns: Json }
      rpc_get_dashboard_config: { Args: never; Returns: Json }
      rpc_get_dashboard_stats: { Args: never; Returns: Json }
      rpc_get_department_stats: {
        Args: { p_department_id?: string }
        Returns: Json
      }
      rpc_get_staff_dashboard: { Args: never; Returns: Json }
      rpc_get_staff_performance: {
        Args: {
          p_end_date?: string
          p_staff_id?: string
          p_start_date?: string
        }
        Returns: Json
      }
      rpc_get_staff_workload_stats: {
        Args: { p_supervisor_id: string }
        Returns: Json
      }
      rpc_get_supervisor_dashboard_v2: {
        Args: { p_supervisor_id: string }
        Returns: Json
      }
      rpc_get_team_overview: {
        Args: { p_supervisor_id: string }
        Returns: Json
      }
      rpc_get_user_profile: { Args: never; Returns: Json }
      rpc_is_profile_complete: { Args: never; Returns: Json }
      rpc_promote_to_admin: { Args: { p_user_id: string }; Returns: Json }
      rpc_search_complaints: {
        Args: {
          p_category_id?: string
          p_date_from?: string
          p_date_to?: string
          p_is_overdue?: boolean
          p_limit?: number
          p_offset?: number
          p_priority?: Database["public"]["Enums"]["complaint_priority"][]
          p_search_term?: string
          p_sort_by?: string
          p_sort_order?: string
          p_status?: Database["public"]["Enums"]["complaint_status"][]
          p_ward_id?: string
        }
        Returns: Json
      }
      rpc_staff_check_in: {
        Args: { p_device_id?: string; p_lat: number; p_lng: number }
        Returns: Json
      }
      rpc_staff_check_out: {
        Args: { p_lat: number; p_lng: number }
        Returns: Json
      }
      rpc_start_assignment: {
        Args: { p_assignment_id: string; p_checkin_location?: Json }
        Returns: Json
      }
      rpc_submit_complaint: {
        Args: {
          p_address_text?: string
          p_category_id: string
          p_description: string
          p_is_anonymous?: boolean
          p_landmark?: string
          p_location_point?: Json
          p_phone?: string
          p_priority?: Database["public"]["Enums"]["complaint_priority"]
          p_source?: Database["public"]["Enums"]["complaint_source"]
          p_subcategory_id?: string
          p_title: string
          p_ward_id?: string
        }
        Returns: Json
      }
      rpc_submit_feedback: {
        Args: {
          p_complaint_id: string
          p_feedback_text?: string
          p_issue_resolved: boolean
          p_rating: number
          p_would_recommend: boolean
        }
        Returns: Json
      }
      rpc_update_user_profile: {
        Args: {
          p_address_line1?: string
          p_address_line2?: string
          p_citizenship_number?: string
          p_date_of_birth?: string
          p_full_name?: string
          p_full_name_nepali?: string
          p_gender?: string
          p_landmark?: string
          p_language_preference?: string
          p_phone?: string
          p_ward_id?: string
        }
        Returns: Json
      }
      rpc_upload_complaint_attachment: {
        Args: {
          p_complaint_id: string
          p_file_name: string
          p_file_path: string
          p_file_size: number
          p_file_type: string
          p_thumbnail_url?: string
        }
        Returns: Json
      }
      rpc_vote_for_proposal: { Args: { p_proposal_id: string }; Returns: Json }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      achievement_type: "speed" | "quality" | "volume" | "consistency"
      analytics_chart_type:
        | "line"
        | "bar"
        | "pie"
        | "doughnut"
        | "heatmap"
        | "scatter"
        | "table"
      attendance_status:
        | "present"
        | "late"
        | "half_day"
        | "absent"
        | "on_leave"
        | "field_duty"
      bill_type:
        | "property_tax"
        | "business_license"
        | "water_bill"
        | "waste_management"
        | "parking_fine"
        | "building_permit"
        | "event_permit"
        | "other_fee"
      checkin_method: "gps" | "qr_code" | "manual" | "supervisor_override"
      complaint_priority: "critical" | "urgent" | "high" | "medium" | "low"
      complaint_source:
        | "web"
        | "mobile"
        | "call_center"
        | "field_office"
        | "email"
      complaint_status:
        | "pending"
        | "received"
        | "under_review"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "closed"
        | "rejected"
        | "reopened"
      escalation_target:
        | "admin"
        | "senior_supervisor"
        | "other_department"
        | "external_agency"
      integration_service:
        | "payment_gateway"
        | "sms_service"
        | "email_service"
        | "map_service"
        | "analytics_service"
        | "storage_service"
      inventory_category:
        | "electrical"
        | "plumbing"
        | "road_materials"
        | "safety_gear"
        | "tools"
        | "general"
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      leave_type:
        | "casual"
        | "sick"
        | "annual"
        | "maternity"
        | "paternity"
        | "bereavement"
        | "unpaid"
      maintenance_type:
        | "emergency"
        | "scheduled"
        | "rolling"
        | "database"
        | "infrastructure"
      notification_type:
        | "complaint_status"
        | "complaint_assigned"
        | "comment_added"
        | "new_notice"
        | "bill_generated"
        | "payment_success"
        | "system_announcement"
        | "sla_warning"
        | "sla_breach"
        | "task_assigned"
        | "task_overdue"
        | "staff_escalation"
        | "new_message"
        | "report_ready"
        | "leave_request"
        | "broadcast"
        | "feedback_received"
      payment_method:
        | "credit_card"
        | "debit_card"
        | "bank_transfer"
        | "esewa"
        | "khalti"
        | "ime_pay"
        | "connect_ips"
        | "cash"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      portal_type: "citizen" | "staff" | "supervisor" | "admin"
      proposal_category:
        | "road_infrastructure"
        | "water_sanitation"
        | "waste_management"
        | "electricity"
        | "health_safety"
        | "parks_environment"
        | "building_construction"
        | "education_culture"
        | "other"
      proposal_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved_for_voting"
        | "selected"
        | "rejected"
        | "in_progress"
        | "completed"
      report_export_format: "pdf" | "excel" | "csv" | "json" | "html"
      report_format: "pdf" | "excel" | "csv" | "html"
      report_schedule_frequency:
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
        | "custom"
      sla_breach_action:
        | "notify_supervisor"
        | "escalate_department"
        | "notify_admin"
        | "auto_reassign"
        | "mark_priority"
        | "custom_action"
      staff_availability_status:
        | "available"
        | "busy"
        | "on_break"
        | "off_duty"
        | "on_leave"
        | "training"
      supervisor_level: "ward" | "department" | "combined" | "senior"
      task_execution_status:
        | "not_started"
        | "in_progress"
        | "paused"
        | "awaiting_parts"
        | "awaiting_approval"
        | "completed"
        | "rejected"
        | "cancelled"
      task_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "overdue"
        | "cancelled"
      task_type:
        | "preventive_maintenance"
        | "inspection"
        | "follow_up"
        | "project_work"
        | "administrative"
        | "training"
        | "emergency_response"
        | "routine_check"
      user_role:
        | "admin"
        | "dept_head"
        | "dept_staff"
        | "ward_staff"
        | "field_staff"
        | "call_center"
        | "citizen"
        | "business_owner"
        | "tourist"
      work_log_type:
        | "status_update"
        | "work_started"
        | "work_progress"
        | "photo_upload"
        | "check_in"
        | "check_out"
        | "material_used"
        | "issue_reported"
        | "completion_submitted"
        | "field_report"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_type: ["speed", "quality", "volume", "consistency"],
      analytics_chart_type: [
        "line",
        "bar",
        "pie",
        "doughnut",
        "heatmap",
        "scatter",
        "table",
      ],
      attendance_status: [
        "present",
        "late",
        "half_day",
        "absent",
        "on_leave",
        "field_duty",
      ],
      bill_type: [
        "property_tax",
        "business_license",
        "water_bill",
        "waste_management",
        "parking_fine",
        "building_permit",
        "event_permit",
        "other_fee",
      ],
      checkin_method: ["gps", "qr_code", "manual", "supervisor_override"],
      complaint_priority: ["critical", "urgent", "high", "medium", "low"],
      complaint_source: [
        "web",
        "mobile",
        "call_center",
        "field_office",
        "email",
      ],
      complaint_status: [
        "pending",
        "received",
        "under_review",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
        "reopened",
      ],
      escalation_target: [
        "admin",
        "senior_supervisor",
        "other_department",
        "external_agency",
      ],
      integration_service: [
        "payment_gateway",
        "sms_service",
        "email_service",
        "map_service",
        "analytics_service",
        "storage_service",
      ],
      inventory_category: [
        "electrical",
        "plumbing",
        "road_materials",
        "safety_gear",
        "tools",
        "general",
      ],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      leave_type: [
        "casual",
        "sick",
        "annual",
        "maternity",
        "paternity",
        "bereavement",
        "unpaid",
      ],
      maintenance_type: [
        "emergency",
        "scheduled",
        "rolling",
        "database",
        "infrastructure",
      ],
      notification_type: [
        "complaint_status",
        "complaint_assigned",
        "comment_added",
        "new_notice",
        "bill_generated",
        "payment_success",
        "system_announcement",
        "sla_warning",
        "sla_breach",
        "task_assigned",
        "task_overdue",
        "staff_escalation",
        "new_message",
        "report_ready",
        "leave_request",
        "broadcast",
        "feedback_received",
      ],
      payment_method: [
        "credit_card",
        "debit_card",
        "bank_transfer",
        "esewa",
        "khalti",
        "ime_pay",
        "connect_ips",
        "cash",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      portal_type: ["citizen", "staff", "supervisor", "admin"],
      proposal_category: [
        "road_infrastructure",
        "water_sanitation",
        "waste_management",
        "electricity",
        "health_safety",
        "parks_environment",
        "building_construction",
        "education_culture",
        "other",
      ],
      proposal_status: [
        "draft",
        "submitted",
        "under_review",
        "approved_for_voting",
        "selected",
        "rejected",
        "in_progress",
        "completed",
      ],
      report_export_format: ["pdf", "excel", "csv", "json", "html"],
      report_format: ["pdf", "excel", "csv", "html"],
      report_schedule_frequency: [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
        "custom",
      ],
      sla_breach_action: [
        "notify_supervisor",
        "escalate_department",
        "notify_admin",
        "auto_reassign",
        "mark_priority",
        "custom_action",
      ],
      staff_availability_status: [
        "available",
        "busy",
        "on_break",
        "off_duty",
        "on_leave",
        "training",
      ],
      supervisor_level: ["ward", "department", "combined", "senior"],
      task_execution_status: [
        "not_started",
        "in_progress",
        "paused",
        "awaiting_parts",
        "awaiting_approval",
        "completed",
        "rejected",
        "cancelled",
      ],
      task_status: [
        "not_started",
        "in_progress",
        "completed",
        "overdue",
        "cancelled",
      ],
      task_type: [
        "preventive_maintenance",
        "inspection",
        "follow_up",
        "project_work",
        "administrative",
        "training",
        "emergency_response",
        "routine_check",
      ],
      user_role: [
        "admin",
        "dept_head",
        "dept_staff",
        "ward_staff",
        "field_staff",
        "call_center",
        "citizen",
        "business_owner",
        "tourist",
      ],
      work_log_type: [
        "status_update",
        "work_started",
        "work_progress",
        "photo_upload",
        "check_in",
        "check_out",
        "material_used",
        "issue_reported",
        "completion_submitted",
        "field_report",
      ],
    },
  },
} as const
