"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { paymentsApi } from "../api";
import { BillFilters, PaymentFilters, ProcessPaymentParams } from "../types";

export const PAYMENT_KEYS = {
  all: ["payments"] as const,
  bills: () => [...PAYMENT_KEYS.all, "bills"] as const,
  billList: (filters: BillFilters) => [...PAYMENT_KEYS.bills(), "list", filters] as const,
  billDetail: (id: string) => [...PAYMENT_KEYS.bills(), "detail", id] as const,
  transactions: () => [...PAYMENT_KEYS.all, "transactions"] as const,
  transactionList: (filters: PaymentFilters) => [...PAYMENT_KEYS.transactions(), "list", filters] as const,
  stats: (userId: string) => [...PAYMENT_KEYS.all, "stats", userId] as const,
  wallet: (userId: string) => [...PAYMENT_KEYS.all, "wallet", userId] as const,
};

export function useBills(filters: BillFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: PAYMENT_KEYS.billList(filters),
    queryFn: () => paymentsApi.getBills(supabase, filters),
  });
}

export function useBill(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: PAYMENT_KEYS.billDetail(id),
    queryFn: () => paymentsApi.getBillById(supabase, id),
    enabled: !!id,
  });
}

export function usePayments(filters: PaymentFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: PAYMENT_KEYS.transactionList(filters),
    queryFn: () => paymentsApi.getPayments(supabase, filters),
  });
}

export function usePaymentStats(userId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: PAYMENT_KEYS.stats(userId || ""),
    queryFn: () => (userId ? paymentsApi.getBillStatistics(supabase, userId) : null),
    enabled: !!userId,
  });
}

export function useWalletBalance(userId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: PAYMENT_KEYS.wallet(userId || ""),
    queryFn: () => (userId ? paymentsApi.getWalletBalance(supabase, userId) : 0),
    enabled: !!userId,
  });
}

export function usePaymentMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const processPayment = useMutation({
    mutationFn: (params: ProcessPaymentParams) => paymentsApi.processPayment(supabase, params),
    onSuccess: (_, variables) => {
      toast.success("Payment successful");
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      // Also invalidate dashboard if it exists
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => toast.error(error.message || "Payment processing failed"),
  });

  return {
    processPayment,
  };
}
