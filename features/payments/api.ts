import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { Bill, Payment, BillWithDepartment, PaymentWithBill, BillFilters, PaymentFilters, ProcessPaymentParams, PaymentStats, AdminPaymentFilters, AdminPaymentTransaction, PaymentAnalyticsMetrics, RefundRequest } from "./types";

export const paymentsApi = {
  /**
   * BILLS API
   */

  async getBills(client: SupabaseClient<Database>, params: BillFilters) {
    const {
      userId,
      status,
      isOverdue,
      search,
      departmentId,
      limit = 20,
      offset = 0
    } = params;

    let query = (client as any).from("bills").select(`
      *,
      department:departments!bills_department_id_fkey(name, code),
      citizen:users!bills_citizen_id_fkey(email)
    `, { count: "exact" });

    if (userId) query = query.eq("citizen_id", userId);
    if (status?.length) query = query.in("status", status);
    if (departmentId) query = query.eq("department_id", departmentId);
    if (isOverdue !== undefined) query = query.eq("is_overdue", isOverdue);

    if (search) {
      query = query.or(`bill_number.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order("due_date", { ascending: true });

    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    
    return { data: (data || []) as BillWithDepartment[], count: count || 0 };
  },

  async getBillById(client: SupabaseClient<Database>, id: string) {
    const { data, error } = await (client as any)
      .from("bills")
      .select(`*, department:departments!bills_department_id_fkey(name, code)`)
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data as BillWithDepartment;
  },

  /**
   * PAYMENTS & TRANSACTIONS API
   */

  async getPayments(client: SupabaseClient<Database>, params: PaymentFilters) {
    const { userId, billId, status, search, limit = 20, offset = 0 } = params;

    let query = (client as any).from("payments").select(`
      *,
      bill:bills!payments_bill_id_fkey(
        bill_number, 
        amount,
        total_amount,
        bill_type,
        description,
        department:departments(name)
      )
    `, { count: "exact" });

    if (userId) query = query.eq("citizen_id", userId);
    if (billId) query = query.eq("bill_id", billId);
    if (status) query = query.eq("status", status);
    if (search) {
      query = query.or(`transaction_id.ilike.%${search}%,bill(description.ilike.%${search}%)`);
    }

    query = query.order("created_at", { ascending: false });
    
    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []) as PaymentWithBill[], count: count || 0 };
  },

  async getReceipt(client: SupabaseClient<Database>, transactionId: string) {
    const { data, error } = await (client as any)
      .from("payments")
      .select(`
        *,
        bill:bills!payments_bill_id_fkey(
          *,
          department:departments(name, code, logo_url)
        ),
        citizen:users!payments_citizen_id_fkey(
          email,
          profile:user_profiles(full_name, address_line1, phone)
        )
      `)
      .eq("transaction_id", transactionId)
      .single();
    
    if (error) throw error;
    return data as PaymentWithBill;
  },

  async processPayment(client: SupabaseClient<Database>, params: ProcessPaymentParams) {
    const { billId, amount, method, userId, gatewayResponse } = params;

    // 1. Verify Bill
    const { data: bill } = await (client as any)
      .from("bills")
      .select("status, total_amount")
      .eq("id", billId)
      .single();

    if (!bill) throw new Error("Bill not found");
    if (bill.status === "completed") throw new Error("Bill already paid");
    
    // Validate amount (loose check due to potential tax/fees)
    const expected = (bill as any).total_amount || 0;
    if (Math.abs(expected - amount) > 0.1) {
      // Allow it if business logic permits partial payments, otherwise throw
      console.warn(`Amount mismatch: expected ${expected}, got ${amount}`);
    }

    // 2. Create Payment
    const receiptNumber = `RCPT-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    const { data: payment, error } = await (client as any).from("payments").insert({
      bill_id: billId,
      citizen_id: userId,
      amount_paid: amount,
      payment_method: method,
      status: "completed", // Simulation: directly completed
      transaction_id: transactionId,
      receipt_number: receiptNumber,
      gateway_response: gatewayResponse || {},
      updated_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;

    // 3. Mark Bill Paid
    await (client as any).from("bills").update({ 
      status: "completed",
      paid_date: new Date().toISOString().split('T')[0],
      is_overdue: false,
      updated_at: new Date().toISOString()
    }).eq("id", billId);

    return payment as Payment;
  },

  /**
   * ANALYTICS & STATS
   */

  async getBillStatistics(client: SupabaseClient<Database>, userId: string) {
    const { data: bills, error: billsError } = await (client as any)
      .from('bills')
      .select('*')
      .eq('citizen_id', userId);

    if (billsError) throw billsError;

    const billsList = (bills || []) as any[];
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: payments, error: paymentsError } = await (client as any)
      .from('payments')
      .select('amount_paid')
      .eq('citizen_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    if (paymentsError) throw paymentsError;

    const pendingBills = billsList.filter(b => b.status === 'pending');
    const overdueBills = billsList.filter(b => b.is_overdue);
    const totalDue = pendingBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
    const paidThisMonth = (payments || []).reduce((sum: number, payment: any) => sum + (payment.amount_paid || 0), 0);

    return {
      total: billsList.length,
      pending: pendingBills.length,
      overdue: overdueBills.length,
      totalDue,
      paidThisMonth
    } as PaymentStats;
  },

  async getWalletBalance(client: SupabaseClient<Database>, userId: string) {
    const { data, error } = await (client as any)
      .from('citizen_wallets')
      .select('balance')
      .eq('citizen_id', userId)
      .single();

    if (error) return 0;
    return (data as any)?.balance || 0;
  },

  // ==========================================
  // ADMIN: PAYMENT & BILL MANAGEMENT
  // ==========================================

  /**
   * Main ledger query with filters
   */
  async getAllTransactions(
    client: SupabaseClient<Database>,
    filters: AdminPaymentFilters,
    page = 1,
    pageSize = 20
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = (client as any)
      .from("payments")
      .select(`
        *,
        citizen:users!payments_citizen_id_fkey(
          email,
          profile:user_profiles(full_name, profile_photo_url)
        ),
        bill:bills(bill_number, bill_type, description)
      `, { count: "exact" });

    if (filters.status !== 'all') {
      query = query.eq("status", filters.status);
    }
    if (filters.method !== 'all') {
      query = query.eq("payment_method", filters.method);
    }
    if (filters.search) {
      query = query.or(`transaction_id.ilike.%${filters.search}%`);
    }
    if (filters.dateRange.from) {
      query = query.gte("created_at", filters.dateRange.from.toISOString());
    }
    if (filters.dateRange.to) {
      query = query.lte("created_at", filters.dateRange.to.toISOString());
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const transactions: AdminPaymentTransaction[] = (data || []).map((t: any) => ({
      id: t.id,
      transaction_id: t.transaction_id || 'N/A',
      amount_paid: Number(t.amount_paid),
      payment_method: t.payment_method,
      status: t.status,
      created_at: t.created_at,
      citizen: {
        full_name: t.citizen?.profile?.full_name || "Unknown",
        email: t.citizen?.email,
        avatar_url: t.citizen?.profile?.profile_photo_url
      },
      bill: {
        bill_number: t.bill?.bill_number || "N/A",
        bill_type: t.bill?.bill_type,
        description: t.bill?.description
      }
    }));

    return { data: transactions, count: count || 0 };
  },

  /**
   * Get Revenue Analytics
   */
  async getPaymentAnalytics(client: SupabaseClient<Database>) {
    const { data, error } = await (client as any)
      .from("mv_financial_analytics")
      .select("*")
      .order("date", { ascending: true })
      .limit(30);

    if (error) throw error;

    const totalRevenue = (data || []).reduce((acc: number, curr: any) => acc + Number(curr.total_amount), 0);
    const transactions = (data || []).reduce((acc: number, curr: any) => acc + Number(curr.transaction_count), 0);

    return {
      revenue: totalRevenue,
      transactions,
      trend: (data || []).map((d: any) => ({ date: d.date, amount: Number(d.total_amount) })),
      byMethod: (data || []).reduce((acc: any[], curr: any) => {
         const existing = acc.find(i => i.method === curr.payment_method);
         if (existing) existing.amount += Number(curr.total_amount);
         else acc.push({ method: curr.payment_method, amount: Number(curr.total_amount) });
         return acc;
      }, [])
    } as PaymentAnalyticsMetrics;
  },

  /**
   * Process Refund
   */
  async processRefund(client: SupabaseClient<Database>, refundId: string, status: 'approved' | 'rejected', notes: string) {
    const { data, error } = await (client as any).rpc("rpc_process_refund", {
       p_refund_id: refundId,
       p_status: status,
       p_notes: notes
    });

    if (error) throw error;
    return data;
  },

  /**
   * Create a new bill manually
   */
  async createBill(client: SupabaseClient<Database>, billData: any) {
    const { data, error } = await (client as any)
      .from("bills")
      .insert({
        ...billData,
        bill_number: `BILL-${Date.now()}`,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Send Notification
    await (client as any).from("notifications").insert({
        user_id: billData.citizen_id,
        type: 'bill_generated',
        title: 'New Bill Issued',
        message: `A new bill for ${billData.bill_type} of NPR ${billData.total_amount} has been generated.`,
        bill_id: (data as any).id,
        priority: 'medium'
    });

    return data as Bill;
  },

  /**
   * Fetch Pending Bills
   */
  async getPendingBills(client: SupabaseClient<Database>) {
    const { data, error } = await (client as any)
      .from("bills")
      .select(`
        *,
        citizen:users!bills_citizen_id_fkey(
          profile:user_profiles(full_name, phone)
        )
      `)
      .eq("status", "pending")
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get Refund Requests
   */
  async getRefundRequests(client: SupabaseClient<Database>) {
      const { data, error } = await (client as any)
        .from("refund_requests")
        .select(`
            *,
            citizen:users!refund_requests_citizen_id_fkey(
                profile:user_profiles(full_name)
            )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });
    
      if (error) throw error;
      return data as RefundRequest[];
  }
};
