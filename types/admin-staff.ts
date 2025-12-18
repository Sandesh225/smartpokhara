export type StaffRole = 'admin' | 'dept_head' | 'dept_staff' | 'ward_staff' | 'field_staff' | 'call_center';
export type StaffAvailability = 'available' | 'busy' | 'on_break' | 'off_duty' | 'on_leave';

export interface AdminStaffListItem {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  staff_code: string;
  staff_role: StaffRole;
  department_name: string | null;
  ward_number: number | null;
  is_supervisor: boolean;
  is_active: boolean;
  availability_status: StaffAvailability;
  current_workload: number;
  created_at: string;
  avatar_url?: string;
}

export interface StaffFiltersState {
  search: string;
  role: StaffRole | 'all';
  department_id: string | null;
  ward_id: string | null;
  status: 'active' | 'inactive' | 'all';
}

export interface CreateStaffInput {
  email: string;
  full_name: string;
  phone: string;
  staff_role: StaffRole;
  department_id?: string;
  ward_id?: string;
  is_supervisor: boolean;
  specializations?: string[];
}

export interface StaffPerformanceData {
  user_id: string;
  full_name: string;
  total_complaints: number;
  resolved_complaints: number;
  active_complaints: number;
  avg_assignment_hours: number;
  on_time_resolutions: number;
  avg_rating: number;
  current_workload: number;
}