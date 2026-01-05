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
      toast.success("Complaint closed successfully");
      setIsCloseDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to close complaint");
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
      toast.error("Failed to load staff list");
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
        toast.success("Reassigned successfully");
      } else {
        await supervisorComplaintsQueries.assignComplaint(
          supabase,
          complaint.id,
          staffId,
          note,
          userId
        );
        toast.success("Assigned successfully");
      }
      setIsAssignModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Assignment failed");
    }
  };

  return (
    <>
      <div className="glass sticky top-0 z-40 w-full transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: ID & Context */}
          <div className="flex items-center gap-4">
            <Link
              href="/supervisor/complaints"
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {complaint.tracking_code}
                </h1>
                <StatusBadge status={complaint.status} variant="complaint" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>
                  {format(
                    new Date(complaint.submitted_at),
                    "MMM d, yyyy • h:mm a"
                  )}
                </span>
                <span>•</span>
                <PriorityIndicator priority={complaint.priority} size="sm" />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Utilities (Hidden on mobile) */}
            <div className="hidden md:flex items-center border-r border-border pr-3 mr-1 space-x-1">
              {[Printer, Share2, Download].map((Icon, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Primary Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCloseDialogOpen(true)}
              className="hidden sm:flex text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Close
            </Button>

            <Button
              size="sm"
              onClick={loadStaffForAssignment}
              disabled={isLoadingStaff}
              className="min-w-[130px]"
            >
              {isLoadingStaff ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : isAssigned ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Reassign
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" /> Assign Staff
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
        title="Close Complaint"
        message="This will mark the complaint as resolved. This action is final."
        confirmLabel="Close Complaint"
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