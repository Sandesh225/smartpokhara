import { Database } from "@/lib/types/database.types";

export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type BillStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type BillWithDepartment = Bill & {
  department?: {
    name: string;
    code?: string;
  } | null;
  citizen?: {
    email: string;
  } | null;
};

export type PaymentWithBill = Payment & {
  bill: {
    bill_number: string;
    amount?: number;
    total_amount?: number;
    bill_type?: string;
    description?: string;
    department?: {
      name: string;
    } | null;
  } | null;
};

export interface BillFilters {
  userId?: string;
  status?: BillStatus[];
  isOverdue?: boolean;
  departmentId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface PaymentFilters {
  userId?: string;
  billId?: string;
  status?: PaymentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ProcessPaymentParams {
  billId: string;
  amount: number;
  method: "esewa" | "khalti" | "bank_transfer" | "connect_ips" | "cash" | "credit_card" | "debit_card" | "ime_pay";
  userId: string;
  gatewayResponse?: any;
}

export interface PaymentStats {
  total: number;
  pending: number;
  overdue: number;
  totalDue: number;
  paidThisMonth: number;
}

// ==========================================
// ADMIN TYPES
// ==========================================

export interface AdminPaymentTransaction {
  id: string;
  transaction_id: string;
  amount_paid: number;
  payment_method: string;
  status: PaymentStatus;
  created_at: string;
  citizen: {
    full_name: string;
    email?: string;
    avatar_url?: string;
  };
  bill: {
    bill_number: string;
    bill_type?: string;
    description?: string;
  };
}

export interface PaymentAnalyticsMetrics {
  revenue: number;
  transactions: number;
  trend: { date: string; amount: number }[];
  byMethod: { method: string; amount: number }[];
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

export interface AdminPaymentFilters {
  search: string;
  status: PaymentStatus | 'all';
  method: string | 'all';
  dateRange: { from: Date | null; to: Date | null };
}
