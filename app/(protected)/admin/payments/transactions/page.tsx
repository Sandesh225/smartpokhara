"use client";

import { usePaymentManagement } from "@/hooks/admin/usePaymentManagement";
import { TransactionsTable } from "../_components/TransactionsTable";
import { TransactionFilters } from "../_components/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function TransactionsPage() {
  const { transactions, filters, setFilters, loading } = usePaymentManagement();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Transaction Ledger</h1>
          <Button variant="outline">
             <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
       </div>

       <TransactionFilters 
          filters={filters} 
          onFilterChange={setFilters} 
          onClear={() => setFilters({
             search: "", status: 'all', method: 'all', date_range: { from: null, to: null }
          })} 
       />

       {loading ? (
          <div className="p-10 text-center text-gray-500">Loading ledger...</div>
       ) : (
          <TransactionsTable data={transactions} />
       )}
    </div>
  );
}