"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw, Loader2 } from "lucide-react";
// Or useToast hook
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
/ui/;
import { Label } from "@/components/ui/label";
/ui/;
import { Textarea } from "@/ui/textarea/ui";
import { useToast } from "@/hooks/use-toast";

interface Props {
  complaintId: string;
  status: string;
}

export default function SupervisorResolutionReview({ complaintId, status }: Props) {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  if (status !== "resolved") return null;

  const handleApprove = async () => {
    if (!confirm("Confirm resolution and close this complaint?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc("rpc_supervisor_review_resolution", {
        p_complaint_id: complaintId,
        p_action: "approve",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Complaint verified and closed." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("rpc_supervisor_review_resolution", {
        p_complaint_id: complaintId,
        p_action: "reopen",
        p_note: reopenReason
      });

      if (error) throw error;

      toast({ title: "Reopened", description: "Complaint sent back to In Progress." });
      setReopenModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 className="font-semibold text-amber-900">Resolution Pending Review</h4>
        <p className="text-sm text-amber-700">Field staff has marked this as resolved. Verify and close?</p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          className="border-amber-600 text-amber-700 hover:bg-amber-100 bg-transparent"
          onClick={() => setReopenModalOpen(true)}
          disabled={loading}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reopen
        </Button>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleApprove}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
          Approve & Close
        </Button>
      </div>

      {/* Reopen Reason Modal */}
      <Dialog open={reopenModalOpen} onOpenChange={setReopenModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen Complaint</DialogTitle>
            <DialogDescription>
              Provide a reason why the resolution was rejected. This will be sent to the staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Reason for Rejection</Label>
            <Textarea 
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The pothole is still visible..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReopenModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReopen} disabled={!reopenReason || loading} variant="destructive">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Reopen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}