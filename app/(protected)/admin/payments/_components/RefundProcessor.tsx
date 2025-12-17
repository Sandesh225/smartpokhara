"use client";

import { useState } from "react";
import { RefundRequest } from "@/types/admin-payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { adminPaymentQueries } from "@/lib/supabase/queries/admin/payments";
import { toast } from "sonner";
import { format } from "date-fns";

interface RefundProcessorProps {
  requests: RefundRequest[];
  onRefresh: () => void;
}

export function RefundProcessor({ requests, onRefresh }: RefundProcessorProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const supabase = createClient();

  const handleProcess = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this refund?`)) return;
    
    setProcessingId(id);
    try {
      await adminPaymentQueries.processRefund(supabase, id, status, notes);
      toast.success(`Refund ${status} successfully`);
      setNotes("");
      onRefresh();
    } catch (error) {
      toast.error("Failed to process refund");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <Card key={req.id}>
           <CardContent className="p-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h4 className="font-bold text-lg text-gray-900">{req.citizen.full_name}</h4>
                    <p className="text-sm text-gray-500">Requested {format(new Date(req.created_at), "PPP")}</p>
                    <div className="mt-2 p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-100">
                       <span className="font-semibold">Reason:</span> {req.reason}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">NPR {req.amount.toLocaleString()}</div>
                    <Badge variant="outline" className="mt-1">Txn: {req.payment_id.slice(0,8)}...</Badge>
                 </div>
              </div>

              <div className="mt-6 pt-4 border-t flex gap-4 items-end">
                 <div className="flex-1">
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Admin Notes</label>
                    <Textarea 
                       placeholder="Reason for approval/rejection..." 
                       value={notes} 
                       onChange={(e) => setNotes(e.target.value)}
                       className="h-20"
                    />
                 </div>
                 <div className="flex gap-2">
                    <Button 
                       variant="outline" 
                       className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                       onClick={() => handleProcess(req.id, 'rejected')}
                       disabled={!!processingId}
                    >
                       Reject
                    </Button>
                    <Button 
                       className="bg-green-600 hover:bg-green-700 text-white"
                       onClick={() => handleProcess(req.id, 'approved')}
                       disabled={!!processingId}
                    >
                       {processingId === req.id ? "Processing..." : "Approve Refund"}
                    </Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      ))}
      {requests.length === 0 && (
         <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No pending refund requests.</p>
         </div>
      )}
    </div>
  );
}