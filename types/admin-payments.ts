export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'esewa' | 'khalti' | 'ime_pay' | 'connect_ips' | 'cash';
export type BillType = 'property_tax' | 'business_license' | 'water_bill' | 'waste_management' | 'other_fee';

export interface PaymentTransaction {
  id: string;
  transaction_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
  citizen: {
    full_name: string;
    email?: string;
    avatar_url?: string;
  };
  bill: {
    bill_number: string;
    bill_type: BillType;
    description?: string;
  };
  is_flagged?: boolean; // Virtual field for frontend logic
  flag_reason?: string;
}

export interface PaymentAnalyticsMetrics {
  total_revenue: number;
  transaction_count: number;
  revenue_by_method: { method: string; amount: number }[];
  revenue_trend: { date: string; amount: number }[];
}

export interface Bill {
  id: string;
  bill_number: string;
  amount: number;
  status: string;
  due_date: string;
  citizen: {
    full_name: string;
    phone: string;
  };
}

export interface RefundRequest {
  id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
  payment_id: string;
  citizen: {
    full_name: string;
  };
}

export interface PaymentFiltersState {
  search: string;
  status: PaymentStatus | 'all';
  method: PaymentMethod | 'all';
  date_range: { from: Date | null; to: Date | null };
}