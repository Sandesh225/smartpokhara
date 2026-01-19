"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Share2,
  Printer,
  Download,
  RefreshCw,
  UserPlus,
  XCircle,
  Command,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { ConfirmationDialog } from "@/components/supervisor/shared/ConfirmationDialog";
import { StaffSelectionModal } from "@/components/supervisor/modals/StaffSelectionModal";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff } from "@/lib/types/supervisor.types";
import { cn } from "@/lib/utils";

export function ComplaintDetailHeader({
  complaint,
  userId,
}: {
  complaint: any;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<AssignableStaff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const isAssigned = !!complaint.assigned_staff_id;
  const currentStaffName =
    complaint.assigned_staff?.full_name || "Unknown Staff";

  const handleCloseComplaint = async () => {
    try {
      await supervisorComplaintsQueries.closeComplaint(
        supabase,
        complaint.id,
        "Closed via header action"
      );
      toast.success("Operations Terminated: Complaint Closed");
      setIsCloseDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Handshake Failed: Could not close record");
    }
  };

  const loadStaffForAssignment = async () => {
    setIsLoadingStaff(true);
    try {
      const staff = await supervisorStaffQueries.getSupervisedStaff(
        supabase,
        userId
      );
      const location = complaint.location_point?.coordinates
        ? {
            lat: complaint.location_point.coordinates[1],
            lng: complaint.location_point.coordinates[0],
          }
        : null;
      setStaffList(getSuggestedStaff(staff, location));
      setIsAssignModalOpen(true);
    } catch (error) {
      toast.error("Transmission Error: Staff registry unavailable");
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleAssign = async (
    staffId: string,
    note: string,
    options: any,
    reason?: string
  ) => {
    try {
      if (isAssigned) {
        await supervisorComplaintsQueries.reassignComplaint(
          supabase,
          complaint.id,
          staffId,
          reason || "Reassignment",
          note,
          userId
        );
        toast.success("Protocol Updated: Staff Reassigned");
      } else {
        await supervisorComplaintsQueries.assignComplaint(
          supabase,
          complaint.id,
          staffId,
          note,
          userId
        );
        toast.success("Task Synchronized: Staff Assigned");
      }
      setIsAssignModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Assignment Interrupted: Database rejected the update");
    }
  };

  return (
    <>
      <div className="glass sticky top-0 z-40 w-full border-b border-white/10 dark:border-primary/20 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left Section: Back Link & Context Identity */}
          <div className="flex items-center gap-5">
            <Link
              href="/supervisor/complaints"
              className="p-2.5 rounded-xl bg-muted/20 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
              aria-label="Back to Ledger"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter">
                  <Command className="w-3 h-3" /> Ledger
                </span>
                <h1 className="text-xl font-black text-foreground tracking-tighter dark:text-glow">
                  {complaint.tracking_code}
                </h1>
                <StatusBadge status={complaint.status} variant="complaint" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                <span className="opacity-70">
                  {format(
                    new Date(complaint.submitted_at),
                    "MMM d, yyyy // HH:mm 'Z'"
                  )}
                </span>
                <span className="text-primary/30">•</span>
                <PriorityIndicator priority={complaint.priority} size="sm" />
              </div>
            </div>
          </div>

          {/* Right Section: Action Controls */}
          <div className="flex items-center gap-4">
            {/* Tactical Utility Group */}
            <div className="hidden lg:flex items-center gap-1 px-3 border-r border-white/10 dark:border-primary/10 mr-2">
              {[Printer, Share2, Download].map((Icon, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Termination Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCloseDialogOpen(true)}
              className="hidden sm:flex h-10 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest border-destructive/20 text-destructive hover:bg-destructive/10 transition-all active:scale-95"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Terminate
            </Button>

            {/* Deployment Action */}
            <Button
              size="sm"
              onClick={loadStaffForAssignment}
              disabled={isLoadingStaff}
              className={cn(
                "h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-glow-sm transition-all active:scale-95",
                isAssigned
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isLoadingStaff ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : isAssigned ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Redeploy
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" /> Deploy Staff
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        onConfirm={handleCloseComplaint}
        title="Protocol Termination"
        message="You are about to permanently close this record. This action will be logged in the jurisdictional audit trail."
        confirmLabel="Confirm Closure"
        variant="danger"
      />

      <StaffSelectionModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
        staffList={staffList}
        complaintTitle={complaint.title}
        mode={isAssigned ? "reassign" : "assign"}
        currentStaff={isAssigned ? { name: currentStaffName } : undefined}
      />
    </>
  );
}