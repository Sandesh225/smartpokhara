import { supabase } from '../client';
import type { Database } from '../../types/database.types';

export type Bill = Database['public']['Tables']['bills']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type BillWithDepartment = Bill & {
  department?: {
    name: string;
    code: string;
  };
};

export interface GetBillsParams {
  status?: string[];
  isOverdue?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'due_date' | 'generated_date' | 'total_amount';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface GetPaymentHistoryParams {
  status?: string[];
  billType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ProcessPaymentRequest {
  billId: string;
  paymentMethod: 'esewa' | 'khalti' | 'connect_ips' | 'bank_transfer' | 'cash';
  amount: number;
  gatewayResponse?: any;
}

export interface ProcessPaymentResponse {
  success: boolean;
  paymentId?: string;
  receiptNumber?: string;
  error?: string;
}

export interface PaymentWithBill extends Payment {
  bill: {
    bill_number: string;
    bill_type: string;
    description: string;
    total_amount: number;
  } | null;
}

export const paymentsService = {
  // Expose the supabase client
  supabase,

  // ========================================================================
  // 1. GET USER BILLS (Pending, Paid, Overdue)
  // ========================================================================
  async getUserBills(params?: GetBillsParams): Promise<{ bills: BillWithDepartment[]; total: number }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const {
        status,
        isOverdue,
        search,
        dateFrom,
        dateTo,
        sortBy = 'due_date',
        sortOrder = 'ASC',
        limit = 20,
        offset = 0
      } = params || {};

      // FIX: Removed 'department:departments!bills_department_id_fkey(name, code)' 
      // because the bills table likely doesn't have a department_id column/FK based on the schema.
      let query = supabase
        .from('bills')
        .select('*', { count: 'exact' })
        .eq('citizen_id', user.id)
        .order(sortBy, { ascending: sortOrder === 'ASC' })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (status && status.length > 0) {
        query = query.in('status', status);
      }
      
      if (isOverdue !== undefined) {
        query = query.eq('is_overdue', isOverdue);
      }
      
      if (search) {
        query = query.or(`bill_number.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (dateFrom) {
        query = query.gte('due_date', dateFrom.toISOString());
      }
      
      if (dateTo) {
        query = query.lte('due_date', dateTo.toISOString());
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        bills: (data || []) as BillWithDepartment[],
        total: count || 0
      };

    } catch (error: any) {
      // Improved error logging
      console.error('Error fetching bills:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  // ========================================================================
  // 2. GET BILL BY ID
  // ========================================================================
  async getBillById(billId: string): Promise<BillWithDepartment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // FIX: Removed invalid department relationship join
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .eq('citizen_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data as BillWithDepartment;

    } catch (error: any) {
      console.error('Error fetching bill:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  // ========================================================================
  // 3. GET PAYMENT HISTORY
  // ========================================================================
  async getPaymentHistory(params?: GetPaymentHistoryParams): Promise<{ payments: PaymentWithBill[]; total: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const {
        status,
        billType,
        dateFrom,
        dateTo,
        search,
        limit = 20,
        offset = 0
      } = params || {};

      let query = supabase
        .from('payments')
        .select(
          `*,
          bill:bills!payments_bill_id_fkey(
            bill_number,
            bill_type,
            description,
            total_amount
          )`,
          { count: 'exact' }
        )
        .eq('citizen_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (status && status.length > 0) {
        query = query.in('status', status);
      }
      
      if (billType) {
        query = query.eq('bill.bill_type', billType);
      }
      
      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
      
      if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }
      
      if (search) {
        // Note: Searching on joined tables is complex in PostgREST, 
        // simplified here to just transaction_id and receipt_number
        query = query.or(
          `transaction_id.ilike.%${search}%,receipt_number.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      // Transform the data to ensure proper typing
      const payments: PaymentWithBill[] = (data || []).map(item => ({
        ...item,
        bill: item.bill || null
      }));

      return {
        payments,
        total: count || 0
      };

    } catch (error: any) {
      console.error('Error fetching payment history:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  // ========================================================================
  // 4. PROCESS PAYMENT
  // ========================================================================
  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { billId, paymentMethod, amount, gatewayResponse } = request;

      // Verify bill exists and is payable
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .eq('citizen_id', user.id)
        .eq('status', 'pending')
        .single();

      if (billError || !bill) {
        throw new Error('Bill not found or already paid');
      }

      // Validate amount
      if (Math.abs(bill.total_amount - amount) > 0.01) {
        throw new Error(`Payment amount mismatch. Expected: ${bill.total_amount}, Provided: ${amount}`);
      }

      // Generate receipt number
      const receiptNumber = this.generateReceiptNumber();

      // For demo, we'll simulate a successful payment
      // In production, you would integrate with actual payment gateway
      const paymentInput = {
        bill_id: billId,
        citizen_id: user.id,
        payment_method: paymentMethod,
        amount_paid: amount,
        status: 'completed',
        receipt_number: receiptNumber,
        gateway_response: gatewayResponse || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentInput)
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. Update bill status (Trigger might handle this, but being explicit is safer)
      const { error: updateError } = await supabase
        .from('bills')
        .update({
          status: 'completed',
          paid_date: new Date().toISOString().split('T')[0],
          is_overdue: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', billId);

      if (updateError) {
         console.warn("Bill update failed, but payment recorded. Check triggers.", updateError);
      }

      return {
        success: true,
        paymentId: paymentData.id,
        receiptNumber: paymentData.receipt_number
      };

    } catch (error: any) {
      console.error('Error processing payment:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  },

  // ========================================================================
  // 5. GET RECEIPT
  // ========================================================================
  async getReceipt(paymentId: string): Promise<{
    payment: PaymentWithBill;
    bill: Bill;
    userProfile: any;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get payment with bill details
      const { data: payment, error } = await supabase
        .from('payments')
        .select(
          `*,
          bill:bills!payments_bill_id_fkey(*)`
        )
        .eq('id', paymentId)
        .eq('citizen_id', user.id)
        .single();

      if (error) throw error;

      // Get user profile for receipt
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        payment: payment as PaymentWithBill,
        bill: payment.bill as Bill,
        userProfile: userProfile
      };

    } catch (error) {
      console.error('Error fetching receipt:', error);
      return null;
    }
  },

  // ========================================================================
  // 6. GET WALLET BALANCE
  // ========================================================================
  async getWalletBalance(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return 0;

      // Check if wallet table exists
      const { data, error } = await supabase
        .from('citizen_wallets') // Fixed table name from schema
        .select('balance')
        .eq('citizen_id', user.id)
        .single();

      if (error) {
        // Wallet table might not exist or user has no wallet
        return 0;
      }

      return data?.balance || 0;

    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  },

  // ========================================================================
  // 7. TOP UP WALLET
  // ========================================================================
  async topUpWallet(amount: number, paymentMethod: string): Promise<{ success: boolean; transactionId?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // In production, initiate gateway payment here
      // For now, assume payment success and update wallet
      
      // Upsert wallet
      // Note: This requires an RPC or direct access if RLS allows
      // For this demo, we'll simulate success
      
      return {
        success: true,
        transactionId: `WALLET-${Date.now()}`
      };

    } catch (error: any) {
      console.error('Error topping up wallet:', error);
      return {
        success: false
      };
    }
  },

  // ========================================================================
  // 8. CALCULATE LATE FEE
  // ========================================================================
  calculateLateFee(dueDate: string, baseAmount: number): number {
    const due = new Date(dueDate);
    const today = new Date();
    
    if (today <= due) return 0;

    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 0.1% per day late, capped at 20%
    const feePercentage = Math.min(0.001 * diffDays, 0.2);
    return Math.round(baseAmount * feePercentage);
  },

  // ========================================================================
  // 9. GET DASHBOARD BILLS (for dashboard)
  // ========================================================================
  async getDashboardBills(limit: number = 5): Promise<Bill[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('citizen_id', user.id)
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []) as Bill[];

    } catch (error) {
      console.error('Error fetching dashboard bills:', error);
      return [];
    }
  },

  // ========================================================================
  // 10. REAL-TIME SUBSCRIPTIONS
  // ========================================================================
  subscribeToBills(
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`user-bills-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `citizen_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToPayments(
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`user-payments-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `citizen_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // ========================================================================
  // 11. GET BILL STATISTICS
  // ========================================================================
  async getBillStatistics(): Promise<{
    total: number;
    pending: number;
    overdue: number;
    totalDue: number;
    paidThisMonth: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          total: 0,
          pending: 0,
          overdue: 0,
          totalDue: 0,
          paidThisMonth: 0
        };
      }

      const userId = user.id;
      
      // Get all bills for user
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .eq('citizen_id', userId);

      if (billsError) throw billsError;

      const billsList = bills || [];
      
      // Get payments for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount_paid')
        .eq('citizen_id', userId)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      if (paymentsError) throw paymentsError;

      const pendingBills = billsList.filter(b => b.status === 'pending');
      const overdueBills = billsList.filter(b => b.is_overdue);
      const totalDue = pendingBills.reduce((sum, bill) => sum + bill.total_amount, 0);
      const paidThisMonth = (payments || []).reduce((sum, payment) => sum + payment.amount_paid, 0);

      return {
        total: billsList.length,
        pending: pendingBills.length,
        overdue: overdueBills.length,
        totalDue,
        paidThisMonth
      };

    } catch (error) {
      console.error('Error fetching bill statistics:', error);
      return {
        total: 0,
        pending: 0,
        overdue: 0,
        totalDue: 0,
        paidThisMonth: 0
      };
    }
  },

  // ========================================================================
  // 12. EXPORT PAYMENT HISTORY
  // ========================================================================
  async exportPaymentHistory(params?: GetPaymentHistoryParams): Promise<string> {
    try {
      // Fetch all payments without pagination
      const { payments } = await this.getPaymentHistory({
        ...params,
        limit: 1000,
        offset: 0
      });

      // Convert to CSV
      const headers = [
        'Receipt Number',
        'Transaction ID',
        'Bill Number',
        'Bill Type',
        'Payment Method',
        'Amount Paid',
        'Status',
        'Payment Date',
        'Description'
      ];

      const rows = payments.map(payment => [
        payment.receipt_number || '',
        payment.transaction_id || '',
        payment.bill?.bill_number || '',
        payment.bill?.bill_type || '',
        payment.payment_method,
        payment.amount_paid.toString(),
        payment.status,
        new Date(payment.created_at).toLocaleDateString(),
        payment.bill?.description || ''
      ]);

      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;

    } catch (error) {
      console.error('Error exporting payment history:', error);
      throw error;
    }
  },

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================
  generateReceiptNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCPT-${year}${month}${day}-${random}`;
  }
};