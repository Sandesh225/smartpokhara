"use client";

import { usePaymentManagement } from "@/hooks/admin/usePaymentManagement";
import { PaymentAnalytics } from "./_components/PaymentAnalytics";
import { TransactionsTable } from "./_components/TransactionsTable";
import { PendingBillsList } from "./_components/PendingBillsList";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentsPage() {
  const { 
    transactions, 
    analytics, 
    pendingBills, 
    loading, 
    filters, 
    setFilters, 
    refresh 
  } = usePaymentManagement();

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
            <p className="text-sm text-gray-500">Monitor revenue, transactions, and billing status.</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
               <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
               Refresh
            </Button>
            <Button variant="outline" size="sm">
               <FileDown className="mr-2 h-4 w-4" /> 
               Export CSV
            </Button>
            <Button size="sm" asChild>
               <Link href="/admin/payments/bills/create">
                 <Plus className="mr-2 h-4 w-4" /> Create Bill
               </Link>
            </Button>
         </div>
      </div>

      {/* Analytics Section */}
      <PaymentAnalytics data={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Ledger (Left Column) */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border gap-4">
               <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
               <div className="w-full sm:w-auto">
                 <Input 
                    placeholder="Search Transaction ID..." 
                    className="w-full sm:w-[240px]"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                 />
               </div>
            </div>
            
            {loading && transactions.length === 0 ? (
               <Card><CardContent className="p-8 text-center text-gray-500">Loading ledger...</CardContent></Card>
            ) : (
               <TransactionsTable data={transactions} />
            )}
         </div>

         {/* Sidebar (Right Column) */}
         <div className="space-y-6">
            <PendingBillsList bills={pendingBills} />
            
            {/* Quick Actions Card */}
            <div className="bg-linear-to-br from-orange-50 to-amber-50 border border-orange-100 p-5 rounded-xl text-center space-y-3">
               <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600 font-bold">
                  $
               </div>
               <div>
                  <h3 className="font-bold text-orange-900">Refund Requests</h3>
                  <p className="text-xs text-orange-700">Review and process citizen refund claims.</p>
               </div>
               <Button variant="outline" className="w-full bg-white border-orange-200 text-orange-800 hover:bg-orange-100 hover:text-orange-900" asChild>
                  <Link href="/admin/payments/refunds">Process Refunds</Link>
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}