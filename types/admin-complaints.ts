export type ComplaintStatus = 'received' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected' | 'reopened';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

export interface AdminComplaintListItem {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  submitted_at: string;
  sla_due_at: string | null;
  ward_id: string;
  category: { name: string };
  ward: { ward_number: number; name: string };
  department?: { name: string };
  citizen: {
    full_name: string;
    avatar_url?: string;
    phone?: string;
    email?: string;
  };
  assigned_staff?: {
    full_name: string;
    staff_code: string;
    avatar_url?: string;
  };
}

export interface ComplaintFiltersState {
  search: string;
  status: ComplaintStatus[];
  priority: ComplaintPriority[];
  ward_id: string | null; // 'all' or specific ID
  category_id?: string | null;
  date_range: { from: Date | null; to: Date | null };
}