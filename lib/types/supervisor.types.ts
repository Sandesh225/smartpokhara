export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SupervisorLevel = "ward" | "department" | "combined" | "senior";
export type TaskType =
  | "maintenance"
  | "inspection"
  | "follow_up"
  | "emergency"
  | "routine"
  | "project"
  | "training";
export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "overdue"
  | "cancelled"
  | "pending_approval";
export type EscalationTarget =
  | "admin"
  | "senior_supervisor"
  | "other_department"
  | "external_agency";
export type StaffAvailability =
  | "available"
  | "busy"
  | "on_break"
  | "off_duty"
  | "on_leave"
  | "training";
export type ReportFormat = "pdf" | "excel" | "csv" | "html";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          is_active?: boolean;
        };
      };
      wards: {
        Row: {
          id: string;
          ward_number: number;
          name: string;
          area_sq_km: number | null;
          population: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ward_number: number;
          name: string;
          area_sq_km?: number | null;
          population?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ward_number?: number;
          name?: string;
          area_sq_km?: number | null;
          population?: number | null;
          is_active?: boolean;
        };
      };
      staff_profiles: {
        Row: {
          user_id: string;
          staff_code: string | null;
          department_id: string | null;
          ward_id: string | null;
          staff_role: string;
          is_supervisor: boolean;
          current_workload: number;
          max_concurrent_assignments: number;
          performance_rating: number;
          availability_status: StaffAvailability;
          last_known_location: string | null;
          last_active_at: string | null;
          is_active: boolean;
        };
      };
      supervisor_profiles: {
        Row: {
          user_id: string;
          supervisor_level: SupervisorLevel;
          assigned_wards: string[];
          assigned_departments: string[];
          can_assign_staff: boolean;
          can_escalate: boolean;
          can_approve_leave: boolean;
          can_generate_reports: boolean;
          can_close_complaints: boolean;
          target_resolution_rate: number;
          target_sla_compliance: number;
          target_citizen_satisfaction: number;
          dashboard_widgets: Json;
        };
      };
      complaints: {
        Row: {
          id: string;
          tracking_code: string;
          citizen_id: string | null;
          title: string;
          category_id: string | null;
          subcategory_id: string | null;
          status: string;
          priority: string;
          ward_id: string | null;
          assigned_staff_id: string | null;
          assigned_department_id: string | null;
          sla_due_at: string | null;
          sla_breached_at: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      supervisor_tasks: {
        Row: {
          id: string;
          tracking_code: string;
          title: string;
          description: string;
          task_type: TaskType;
          priority: string;
          supervisor_id: string;
          assigned_to: string[];
          primary_assigned_to: string | null;
          due_date: string;
          status: TaskStatus;
          budget_allocated: number;
          budget_spent: number;
          location_point: string | null;
          completion_notes: string | null;
          completed_at: string | null;
        };
      };
      sla_extensions: {
        Row: {
          id: string;
          complaint_id: string;
          requested_by: string;
          approved_by: string | null;
          reason_category: string | null;
          reason_text: string;
          original_deadline: string;
          new_deadline: string;
          status: string;
        };
      };
    };
    Views: {
      supervisor_dashboard_metrics: {
        Row: {
          supervisor_id: string;
          active_complaints: number;
          overdue_complaints: number;
          avg_resolution_hours: number;
          team_size: number;
          available_staff_count: number;
        };
      };
    };
    Functions: {
      rpc_get_supervisor_dashboard_v13: {
        Args: { p_supervisor_id: string };
        Returns: Json;
      };
      rpc_recommend_staff_v13: {
        Args: { p_loc: string; p_dept: string };
        Returns: {
          sid: string;
          workload: number;
          dist_km: number;
          rating: number;
        }[];
      };
    };
  };
}
