// app/(protected)/citizen/payments/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard,
  History,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { paymentsApi } from "@/features/payments";
import { subscribeToPayments } from "@/features/payments/realtime/paymentsSubscription";
import { createClient } from "@/lib/supabase/client";
import BillsList from "@/app/(protected)/citizen/payments/_components/BillsList";
import PaymentHistoryTable from "@/app/(protected)/citizen/payments/_components/PaymentHistoryTable";
import WalletCard from "@/app/(protected)/citizen/payments/_components/WalletCard";
import PaymentFilters from "@/app/(protected)/citizen/payments/_components/PaymentFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [activeTab, setActiveTab] = useState<string>("bills");
  const [bills, setBills] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [totalBills, setTotalBills] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    overdue: 0,
    totalDue: 0,
    paidThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Parse URL params
  const page = parseInt(searchParams.get("page") || "1");
  const billStatus = searchParams.get("billStatus") || undefined;
  const paymentSearch = searchParams.get("search") || undefined;
  const tabParam = searchParams.get("tab") || "bills";

  const limit = 10;
  const offset = (page - 1) * limit;

  // Load data
  const loadData = useCallback(async () => {
    const supabase = createClient();
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [billsData, paymentHistoryData, balance, stats] = await Promise.all(
        [
          paymentsApi.getBills(supabase, {
            userId: user.id,
            status: billStatus ? [billStatus as any] : undefined,
            limit,
            offset,
          }),
          paymentsApi.getPayments(supabase, {
            userId: user.id,
            search: paymentSearch,
            limit,
            offset,
          }),
          paymentsApi.getWalletBalance(supabase, user.id),
          paymentsApi.getBillStatistics(supabase, user.id),
        ]
      );

      setBills(billsData.data);
      setTotalBills(billsData.count);
      setPayments(paymentHistoryData.data);
      setTotalPayments(paymentHistoryData.count);
      setWalletBalance(balance);
      setStatistics(stats);
    } catch (error: any) {
      console.error("Error loading payment data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setIsLoading(false);
    }
  }, [page, billStatus, paymentSearch, limit, offset]);

  // Initial load
  useEffect(() => {
    setActiveTab(tabParam);
    loadData();
  }, [tabParam, loadData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    let cleanupFunctions: (() => void)[] = [];

    try {
      const supabase = createClient();
      // Subscribe to payment updates
      const paymentSubscription = subscribeToPayments(
        supabase,
        () => {
          loadData();
        }
      );

      cleanupFunctions.push(() => {
        paymentSubscription.unsubscribe();
      });
    } catch (error) {
      console.error("Error setting up subscriptions:", error);
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error("Error cleaning up subscription:", error);
        }
      });
    };
  }, [userId, loadData]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.delete("page"); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // Handle filter change for bills
  const handleBillFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status && status !== "all") {
      params.set("billStatus", status);
    } else {
      params.delete("billStatus");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  // Handle search for payments
  const handlePaymentSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Online Payments</h1>
        <p className="text-muted-foreground">
          Pay your municipal bills and manage your payment history
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Bills
                </p>
                <p className="text-2xl font-bold">{statistics.pending}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue Bills
                </p>
                <p className="text-2xl font-bold">{statistics.overdue}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Due
                </p>
                <p className="text-2xl font-bold">
                  NPR {statistics.totalDue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Paid This Month
                </p>
                <p className="text-2xl font-bold">
                  NPR {statistics.paidThisMonth.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Balance */}
      {walletBalance > 0 && (
        <div className="mb-8">
          <WalletCard balance={walletBalance} />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PaymentFilters
            onFilterChange={(filters) => {
              const params = new URLSearchParams();
              if (filters.search) params.set("search", filters.search);
              if (filters.billType) params.set("billType", filters.billType);
              if (filters.status) params.set("status", filters.status);
              if (filters.dateFrom)
                params.set("dateFrom", filters.dateFrom.toISOString());
              if (filters.dateTo)
                params.set("dateTo", filters.dateTo.toISOString());
              params.set("page", "1");
              router.push(`/citizen/payments/history?${params.toString()}`);
            }}
            onClear={() => router.push("/citizen/payments/history")}
            initialFilters={{
              search: paymentSearch || "",
              billType: searchParams.get("billType") || "",
              status: searchParams.get("status") || "",
              dateFrom: searchParams.get("dateFrom")
                ? new Date(searchParams.get("dateFrom")!)
                : undefined,
              dateTo: searchParams.get("dateTo")
                ? new Date(searchParams.get("dateTo")!)
                : undefined,
            }}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bills" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pending Bills
                {statistics.pending > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statistics.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Payment History
                {totalPayments > 0 && (
                  <Badge variant="outline" className="ml-1">
                    {totalPayments}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bills" className="mt-6">
              <BillsList
                bills={bills}
                total={totalBills}
                page={page}
                limit={limit}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onFilterChange={handleBillFilterChange}
                currentFilter={billStatus || "all"}
                onSearchChange={(search) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (search) {
                    params.set("search", search);
                  } else {
                    params.delete("search");
                  }
                  params.set("page", "1");
                  router.push(`?${params.toString()}`);
                }}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <PaymentHistoryTable
                payments={payments}
                total={totalPayments}
                page={page}
                limit={limit}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onSearchChange={handlePaymentSearchChange}
                currentSearch={paymentSearch}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
