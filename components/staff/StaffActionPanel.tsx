"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
/ui/;
import { CheckCircle, XCircle, Play, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  complaintId: string;
  status: string;
  onUpdate: () => void;
}

export default function StaffActionPanel({ complaintId, status, onUpdate }: Props) {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"reject" | "resolve" | null>(null);
  const [notes, setNotes] = useState("");

  const handleQuickAction = async (action: "accept") => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("rpc_staff_accept_complaint", {
        p_complaint_id: complaintId,
      });
      if (error) throw error;
      toast({ title: "Complaint Accepted", description: "Status moved to In Progress" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitModal = async () => {
    setLoading(true);
    try {
      if (actionType === "reject") {
        const { error } = await supabase.rpc("rpc_staff_reject_complaint", {
          p_complaint_id: complaintId,
          p_reason: notes,
        });
        if (error) throw error;
        toast({ title: "Complaint Rejected", description: "Supervisor has been notified." });
      } else if (actionType === "resolve") {
        const { error } = await supabase.rpc("rpc_staff_resolve_complaint", {
          p_complaint_id: complaintId,
          p_notes: notes,
          p_photos: [] // Add photo upload logic here if needed
        });
        if (error) throw error;
        toast({ title: "Complaint Resolved", description: "Waiting for supervisor approval." });
      }
      setModalOpen(false);
      onUpdate();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 mt-4">
      {status === "assigned" && (
        <>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleQuickAction("accept")}
            disabled={loading}
          >
            <Play className="w-4 h-4 mr-2" />
            Accept Job
          </Button>
          <Button 
            variant="destructive"
            onClick={() => { setActionType("reject"); setModalOpen(true); }}
            disabled={loading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </>
      )}

      {(status === "in_progress" || status === "accepted") && (
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          onClick={() => { setActionType("resolve"); setModalOpen(true); }}
          disabled={loading}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark as Resolved
        </Button>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "reject" ? "Reject Assignment" : "Resolve Complaint"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              {actionType === "reject" ? "Reason for rejection:" : "Resolution Notes:"}
            </label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder={actionType === "reject" ? "e.g. Not my ward, Requires heavy machinery..." : "Describe work done..."}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button 
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleSubmitModal}
              disabled={loading || !notes}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}