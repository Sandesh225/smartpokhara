import { SupabaseClient } from "@supabase/supabase-js";
import { PaymentFiltersState, PaymentTransaction } from "@/types/admin-payments";

export const adminPaymentQueries = {
  /**
   * Main ledger query with filters
   */
  async getAllTransactions(
    client: SupabaseClient,
    filters: PaymentFiltersState,
    page = 1,
    pageSize = 20
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = client
      .from("payments")
      .select(`
        *,
        citizen:users!payments_citizen_id_fkey(
          email,
          profile:user_profiles(full_name, profile_photo_url)
        ),
        bill:bills(bill_number, bill_type, description)
      `, { count: "exact" });

    // Filters
    if (filters.status !== 'all') {
      query = query.eq("status", filters.status);
    }
    if (filters.method !== 'all') {
      query = query.eq("payment_method", filters.method);
    }
    if (filters.search) {
      query = query.or(`transaction_id.ilike.%${filters.search}%`);
    }
    if (filters.date_range.from) {
      query = query.gte("created_at", filters.date_range.from.toISOString());
    }
    if (filters.date_range.to) {
      query = query.lte("created_at", filters.date_range.to.toISOString());
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Normalize
    const transactions: PaymentTransaction[] = (data || []).map((t: any) => ({
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
   * Get Revenue Analytics using Materialized View
   */
  async getPaymentAnalytics(client: SupabaseClient) {
    // We use the MV created in schema: mv_financial_analytics
    const { data, error } = await client
      .from("mv_financial_analytics")
      .select("*")
      .order("date", { ascending: true })
      .limit(30); // Last 30 days

    if (error) throw error;

    // Aggregations
    const totalRevenue = data.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
    const transactions = data.reduce((acc, curr) => acc + Number(curr.transaction_count), 0);

    return {
      revenue: totalRevenue,
      transactions,
      trend: data.map((d: any) => ({ date: d.date, amount: Number(d.total_amount) })),
      byMethod: data.reduce((acc: any[], curr: any) => {
         const existing = acc.find(i => i.method === curr.payment_method);
         if (existing) existing.amount += Number(curr.total_amount);
         else acc.push({ method: curr.payment_method, amount: Number(curr.total_amount) });
         return acc;
      }, [])
    };
  },

  /**
   * Process Refund using RPC
   */
  async processRefund(client: SupabaseClient, refundId: string, status: 'approved' | 'rejected', notes: string) {
    const { data, error } = await client.rpc("rpc_process_refund", {
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
  async createBill(client: SupabaseClient, billData: any) {
    const { data: { user } } = await client.auth.getUser();
    
    const { data, error } = await client
      .from("bills")
      .insert({
        ...billData,
        bill_number: `BILL-${Date.now()}`,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Send Notification
    await client.from("notifications").insert({
        user_id: billData.citizen_id,
        type: 'bill_generated',
        title: 'New Bill Issued',
        message: `A new bill for ${billData.bill_type} of NPR ${billData.total_amount} has been generated.`,
        bill_id: data.id,
        priority: 'medium'
    });

    return data;
  },

  /**
   * Fetch Pending Bills for AR
   */
  async getPendingBills(client: SupabaseClient) {
    const { data, error } = await client
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
  async getRefundRequests(client: SupabaseClient) {
      const { data, error } = await client
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
      return data;
  }
};