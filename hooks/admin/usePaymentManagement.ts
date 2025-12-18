"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminPaymentQueries } from "@/lib/supabase/queries/admin/payments";
import { subscribeToPayments } from "@/lib/supabase/realtime/admin/payments-subscription";
import { PaymentTransaction, PaymentFiltersState } from "@/types/admin-payments";
import { toast } from "sonner";

export function usePaymentManagement() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<PaymentFiltersState>({
    search: "",
    status: 'all',
    method: 'all',
    date_range: { from: null, to: null }
  });

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txnRes, analyticsRes, billsRes] = await Promise.all([
          adminPaymentQueries.getAllTransactions(supabase, filters),
          adminPaymentQueries.getPaymentAnalytics(supabase),
          adminPaymentQueries.getPendingBills(supabase)
      ]);

      setTransactions(txnRes.data);
      setAnalytics(analyticsRes);
      setPendingBills(billsRes || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  }, [supabase, filters]);

  // Initial Fetch & Realtime
  useEffect(() => {
    loadData();
    const channel = subscribeToPayments(supabase, loadData);
    return () => { supabase.removeChannel(channel); };
  }, [loadData, supabase]);

  return {
    transactions,
    analytics,
    pendingBills,
    loading,
    filters,
    setFilters,
    refresh: loadData
  };
}