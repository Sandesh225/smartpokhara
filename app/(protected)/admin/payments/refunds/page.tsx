"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminPaymentQueries } from "@/lib/supabase/queries/admin/payments";
import { RefundProcessor } from "../_components/RefundProcessor";
import { Loader2 } from "lucide-react";

export default function RefundsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchRefunds = async () => {
    setLoading(true);
    try {
       const data = await adminPaymentQueries.getRefundRequests(supabase);
       setRequests(data || []);
    } catch(e) {
       console.error(e);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold text-gray-900">Refund Processing</h1>
          <p className="text-gray-500">Review and approve refund claims from citizens.</p>
       </div>

       {loading ? (
          <div className="h-40 flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
       ) : (
          <RefundProcessor requests={requests} onRefresh={fetchRefunds} />
       )}
    </div>
  );
}