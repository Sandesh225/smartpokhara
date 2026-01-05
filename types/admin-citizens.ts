export interface CitizenProfile {
  user_id: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  full_name: string;
  full_name_nepali: string | null;
  citizenship_number: string | null;
  ward_id: string | null;
  address_line1: string | null;
  profile_photo_url: string | null;
  created_at: string;
}

export interface ComplaintHistoryItem {
  id: string;
  tracking_code: string;
  title: string;
  status: 'received' | 'under_review' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  submitted_at: string;
  category: {
    name: string;
  };
}

export interface PaymentHistoryItem {
  id: string;
  bill_number: string;
  bill_type: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_date: string;
  paid_date: string | null;
}

export interface WalletSummary {
  total_paid: number;
  total_due: number;
  pending_bills_count: number;
}