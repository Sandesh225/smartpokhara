// lib/types/staff.ts

export interface Achievement {
  id: string;
  badge_name: string;
  description: string;
  icon_key: 'star' | 'medal' | 'zap' | 'award' | string;
  earned_at: string;
}

export interface WorkAssignment {
  id: string;
  created_at: string;
  completed_at: string | null;
  due_at: string | null;
  assignment_status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  priority: string;
  complaint_id: string | null;
}

export interface PerformanceMetrics {
  totalCompleted: number;
  slaCompliance: number;
  avgResolutionTime: number; // in hours
  avgRating: number;
}