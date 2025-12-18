import { Database } from "@/types/database.types";

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskType = 'preventive_maintenance' | 'inspection' | 'follow_up' | 'project_work' | 'administrative' | 'training' | 'emergency_response' | 'routine_check';

export interface AdminTask {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  start_date: string | null;
  completed_at: string | null;
  ward_id: string | null;
  primary_assigned_to: string | null;
  created_at: string;
  assignee?: {
    full_name: string;
    avatar_url?: string;
    email?: string;
    staff_code?: string;
  };
  ward?: {
    ward_number: number;
    name: string;
  };
  supervisor?: {
    full_name: string;
  };
}

export interface TaskFiltersState {
  search: string;
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee_id: string | null;
  date_range: { from: Date | null; to: Date | null };
}

export interface CreateTaskInput {
  title: string;
  description: string;
  task_type: TaskType;
  priority: TaskPriority;
  due_date: Date;
  primary_assigned_to: string;
  ward_id?: string;
}

export interface TaskComment {
  id: string;
  content: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url?: string;
  };
  is_private: boolean;
}