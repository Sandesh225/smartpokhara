import { Database } from "@/lib/types/database.types";

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type TaskType = 'preventive_maintenance' | 'inspection' | 'follow_up' | 'project_work' | 'administrative' | 'training' | 'emergency_response' | 'routine_check';

export type ProjectTask = Database["public"]["Tables"]["supervisor_tasks"]["Row"] & {
  status: TaskStatus;
  priority: TaskPriority;
  task_type: TaskType;
  assignee_name?: string;
  assignee_avatar?: string;
  staff_code?: string;
  assignee_phone?: string;
  supervisor_name?: string;
  ward_name?: string;
  assignee?: {
    full_name?: string;
    avatar_url?: string;
    staff_code?: string;
  } | null;
  supervisor?: {
    full_name?: string;
  } | null;
  ward?: {
    ward_number?: number;
    name?: string;
  } | null;
  checklist_items?: any[];
  comments?: TaskComment[];
};

export type TaskComment = Database["public"]["Tables"]["internal_notes"]["Row"] & {
  author_name?: string;
  author_avatar?: string;
  author?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export type TaskScope = "all" | "assigned_to_me" | "supervisor_view" | "ward_view" | "overdue";

export interface TaskFilters {
  page?: number;
  pageSize?: number;
  status?: string[];
  priority?: string[];
  task_type?: string[];
  search?: string;
  scope?: TaskScope;
  userId?: string;
  wardId?: string;
}

export interface UnifiedAssignment {
  id: string;
  type: "task" | "complaint";
  tracking_code: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  ward_name?: string;
  location?: string;
  assignee?: {
    name?: string;
    avatar?: string;
  };
}

export interface TaskStatistics {
  total: number;
  not_started: number;
  in_progress: number;
  completed: number;
  overdue: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}
