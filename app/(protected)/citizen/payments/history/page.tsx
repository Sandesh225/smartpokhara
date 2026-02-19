// app/(protected)/citizen/payments/history/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Download, History, Search, Filter, FileText, CreditCard } from "lucide-react";
import { paymentsApi } from "@/features/payments";
import PaymentHistoryTable from "@/app/(protected)/citizen/payments/_components/PaymentHistoryTable";
import PaymentFilters from "@/app/(protected)/citizen/payments/_components/PaymentFilters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function PaymentHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  
  // Parse URL params
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const billType = searchParams.get('billType') || undefined;
  const status = searchParams.get('status') || undefined;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  
  const limit = 20;
  const offset = (page - 1) * limit;

  // Fetch data
  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);
      
      const { data, count } = await paymentsApi.getPayments(supabase, {
        userId: currentUser.id,
        search: search || undefined,
        status: status ? (status as any) : undefined,
        limit,
        offset
      });
      
      setPayments(data);
      setTotal(count || 0);
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, search, status, limit, offset]);

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparing CSV export...');
      
      /*
      const csvContent = await paymentsApi.exportPaymentHistory({
        search: search || undefined,
        billType,
        status: status ? [status] : undefined,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined
      });
      */
      toast.error('Export feature is currently undergoing maintenance');
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate summary
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
  const successfulPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="lg:col-span-1 h-96" />
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
            <p className="text-muted-foreground">
              View and download your payment receipts
            </p>
          </div>
          <Button 
            onClick={handleExportCSV} 
            disabled={isExporting || payments.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PaymentFilters
            onFilterChange={(filters) => {
              const params = new URLSearchParams();
              if (filters.search) params.set('search', filters.search);
              if (filters.billType) params.set('billType', filters.billType);
              if (filters.status) params.set('status', filters.status);
              if (filters.dateFrom) params.set('dateFrom', filters.dateFrom.toISOString());
              if (filters.dateTo) params.set('dateTo', filters.dateTo.toISOString());
              params.set('page', '1');
              router.push(`?${params.toString()}`);
            }}
            onClear={() => router.push('/citizen/payments/history')}
            initialFilters={{
              search,
              billType: billType || '',
              status: status || '',
              dateFrom: dateFrom ? new Date(dateFrom) : undefined,
              dateTo: dateTo ? new Date(dateTo) : undefined,
            }}
          />
          
          {/* Summary Card */}
          {payments.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount Paid</p>
                  <p className="text-2xl font-bold">NPR {totalAmount.toFixed(2)}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Successful</span>
                    </div>
                    <Badge variant="outline">{successfulPayments}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge variant="outline">{pendingPayments}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment History Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Transactions</CardTitle>
                  <CardDescription>
                    Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} payments
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9 w-[250px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PaymentHistoryTable
                payments={payments}
                isLoading={isLoading}
                total={total}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
                onSearchChange={handleSearch}
                currentSearch={search}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}