"use client";

import { usePaymentManagement } from "@/hooks/admin/usePaymentManagement";
import { PendingBillsList } from "../_components/PendingBillsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BillsPage() {
  const { pendingBills } = usePaymentManagement();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Invoices & Bills</h1>
          <Button asChild>
             <Link href="/admin/payments/bills/create"><Plus className="w-4 h-4 mr-2" /> Generate New Bill</Link>
          </Button>
       </div>

       <Tabs defaultValue="pending" className="w-full">
          <TabsList>
             <TabsTrigger value="pending">Pending ({pendingBills.length})</TabsTrigger>
             <TabsTrigger value="paid">Paid History</TabsTrigger>
             <TabsTrigger value="overdue">Overdue Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   {/* In a real app, this would be a full table */}
                   <PendingBillsList bills={pendingBills} />
                </div>
             </div>
          </TabsContent>
          <TabsContent value="paid">
             <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">
                Paid bills history would appear here.
             </div>
          </TabsContent>
       </Tabs>
    </div>
  );
}