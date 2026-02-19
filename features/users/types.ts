import { Database } from "@/lib/types/database.types";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  full_name_nepali: string | null;
  email: string;
  phone: string | null;
  ward_id: string | null;
  ward_number: number | null;
  ward_name: string | null;
  ward_name_nepali: string | null;
  address_line1: string | null;
  address_line2: string | null;
  landmark: string | null;
  profile_photo_url: string | null;
  gender?: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserPreferences {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  in_app_notifications: boolean;
  push_notifications: boolean;
  complaint_updates: boolean;
  new_bills: boolean;
  payment_reminders: boolean;
  new_notices: boolean;
  digest_frequency: "immediate" | "daily" | "weekly";
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  user_id: "",
  email_notifications: true,
  sms_notifications: true,
  in_app_notifications: true,
  push_notifications: false,
  complaint_updates: true,
  new_bills: true,
  payment_reminders: true,
  new_notices: true,
  digest_frequency: "immediate",
};

// Admin Citizen Types
export interface CitizenProfile extends UserProfile {
  citizenship_number: string | null;
}

export interface ComplaintHistoryItem {
  id: string;
  tracking_code: string;
  title: string;
  status: 'pending' | 'received' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected' | 'reopened';
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
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  generated_date: string;
  due_date: string;
  paid_date: string | null;
}

export interface WalletSummary {
  total_paid: number;
  total_due: number;
  pending_bills_count: number;
}

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali: string | null;
}
