/**
 * Supervisor Portal Type Definitions
 * * Aggregates types for Complaints, Staff, Tasks, and Notifications
 * aligned with the PostgreSQL schema V4.0.
 */

/* -------------------------------------------------------------------------- */
/* ENUMS                                   */
/* -------------------------------------------------------------------------- */

export type SupervisorLevel = 'ward' | 'department' | 'combined' | 'senior';

export type PriorityLevel = 'critical' | 'urgent' | 'high' | 'medium' | 'low';

export type ComplaintStatus = 
  | 'received' 
  | 'under_review' 
  | 'assigned' 
  | 'in_progress' 
  | 'resolved' 
  | 'closed' 
  | 'rejected' 
  | 'escalated';

export type TaskStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'overdue' 
  | 'cancelled';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/* -------------------------------------------------------------------------- */
/* COMPLAINTS                                 */
/* -------------------------------------------------------------------------- */

export interface ComplaintFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  ward_id?: string[];
  category?: string[]; // category_id array
  assigned_to?: string; // staff_id
  date_from?: string; // ISO Date string
  date_to?: string;   // ISO Date string
  sla_status?: 'on_time' | 'at_risk' | 'overdue';
}

export interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  
  // Relations (Flattened for UI)
  category: {
    id?: string;
    name: string;
  };
  ward: {
    id?: string;
    name: string;
    ward_number: number;
  };
  citizen: {
    full_name: string;
    email?: string;
    phone?: string;
  };
  assigned_staff: {
    user_id?: string;
    full_name: string;
    staff_code?: string;
    avatar_url?: string;
  } | null;

  // Timestamps
  submitted_at: string;
  updated_at: string;
  sla_due_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;
}

/* -------------------------------------------------------------------------- */
/* SUPERVISOR                                  */
/* -------------------------------------------------------------------------- */

export interface SupervisorProfile {
  id: string;
  user_id: string;
  supervisor_level: SupervisorLevel;
  assigned_wards: string[]; // Array of Ward IDs
  assigned_departments: string[]; // Array of Dept IDs
  
  // Permissions Flags
  can_assign_staff: boolean;
  can_escalate: boolean;
  can_close_complaints: boolean;
  can_create_tasks: boolean;
  can_approve_leave: boolean;
  can_generate_reports: boolean;
}

export interface SupervisorNotification {
  id: string;
  supervisor_id: string;
  type: string; // 'complaint_status', 'assignment', 'system', etc.
  title: string;
  message: string;
  priority: NotificationPriority;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string | null;
  metadata?: Record<string, any>;
}

/* -------------------------------------------------------------------------- */
/* TASKS                                    */
/* -------------------------------------------------------------------------- */

export interface SupervisorTask {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  task_type: string;
  priority: PriorityLevel;
  status: TaskStatus;
  due_date: string;
  
  supervisor_id: string;
  primary_assigned_to?: string; // User ID
  assigned_to: string[]; // Array of User IDs
  
  location_point?: { lat: number; lng: number } | null;
  ward_id?: string;
  
  completion_percentage: number;
  checklist_items?: TaskChecklistItem[];
  
  created_at: string;
  updated_at: string;
}

export interface TaskChecklistItem {
  id: string;
  task_id: string;
  description: string;
  is_required: boolean;
  is_completed: boolean;
  display_order: number;
}

/* -------------------------------------------------------------------------- */
/* STAFF                                    */
/* -------------------------------------------------------------------------- */

export interface StaffProfile {
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  staff_code: string;
  department_id?: string;
  ward_id?: string;
  role: string;
  is_active: boolean;
  
  // Workload & Status
  availability_status: 'available' | 'busy' | 'on_break' | 'off_duty' | 'on_leave';
  current_workload: number;
  max_concurrent_assignments: number;
  performance_rating: number;
  last_known_location?: { lat: number; lng: number } | null;
}

export interface AssignableStaff extends StaffProfile {
  capacity_percentage: number;
  distance_km: number | null;
  is_available: boolean;
  recommendation_rank: number;
}