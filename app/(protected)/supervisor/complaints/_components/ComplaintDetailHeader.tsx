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
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { ConfirmationDialog } from "@/components/supervisor/shared/ConfirmationDialog";
import { StaffSelectionModal } from "@/components/supervisor/modals/StaffSelectionModal";
import { supervisorApi } from "@/features/supervisor";
import { complaintsApi } from "@/features/complaints";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff } from "@/lib/types/supervisor.types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
      await complaintsApi.closeComplaint(
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
      const staff = await supervisorApi.getSupervisedStaff(
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
        await complaintsApi.reassignComplaint(
          supabase,
          complaint.id,
          staffId,
          reason || "Reassignment",
          note,
          userId
        );
        toast.success("Staff reassigned successfully");
      } else {
        await complaintsApi.assignComplaint(
          supabase,
          complaint.id,
          staffId,
          userId,
          note
        );
        toast.success("Staff assigned successfully");
      }
      setIsAssignModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Assignment failed");
    }
  };

  return (
    <>
      {/* MOBILE & DESKTOP HEADER */}
      <div className="glass sticky top-0 z-40 w-full border-b border-border backdrop-blur-xl">
        <div className="w-full px-3 sm:px-4 lg:px-6 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-3">
          {/* LEFT SECTION - Back & Info */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 min-w-0 flex-1">
            {/* Back Button */}
            <Link
              href="/supervisor/complaints"
              className="shrink-0 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-muted/20 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
              aria-label="Back to complaints"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            {/* Info Section */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Badge - Hidden on very small screens */}
                <span className="hidden xs:flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-primary/10 text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-tighter shrink-0">
                  <Command className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Ledger</span>
                </span>

                {/* Tracking Code */}
                <h1 className="text-base sm:text-lg lg:text-xl font-black text-foreground tracking-tighter truncate">
                  {complaint.tracking_code}
                </h1>

                {/* Status Badge */}
                <div className="shrink-0">
                  <StatusBadge status={complaint.status} />
                </div>
              </div>

              {/* Metadata Row - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                <span className="opacity-70 truncate">
                  {format(new Date(complaint.submitted_at), "MMM d, yyyy")}
                </span>
                <span className="text-primary/30">•</span>
                <PriorityIndicator priority={complaint.priority} size="sm" />
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Desktop Utility Actions */}
            <div className="hidden lg:flex items-center gap-1 px-2 lg:px-3 border-r border-border">
              {[Printer, Share2, Download].map((Icon, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 lg:h-9 lg:w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg lg:rounded-xl"
                >
                  <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </Button>
              ))}
            </div>

            {/* Close Button - Hidden on mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCloseDialogOpen(true)}
              className="hidden sm:flex h-8 lg:h-10 px-3 lg:px-4 rounded-lg lg:rounded-xl text-[10px] font-bold uppercase tracking-wider border-error-red/30 text-error-red hover:bg-error-red/10"
            >
              <XCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 sm:mr-1.5" />
              <span className="hidden lg:inline">Close</span>
            </Button>

            {/* Assign/Reassign Button */}
            <Button
              size="sm"
              onClick={loadStaffForAssignment}
              disabled={isLoadingStaff}
              className={cn(
                "h-8 sm:h-9 lg:h-10 px-3 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm",
                isAssigned
                  ? "bg-warning-amber hover:bg-warning-amber/90"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isLoadingStaff ? (
                <RefreshCw className="w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin" />
              ) : (
                <>
                  {isAssigned ? (
                    <RefreshCw className="w-3.5 h-3.5 lg:w-4 lg:h-4 sm:mr-1.5" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5 lg:w-4 lg:h-4 sm:mr-1.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isAssigned ? "Redeploy" : "Deploy"}
                  </span>
                </>
              )}
            </Button>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden h-8 w-8"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsCloseDialogOpen(true)}>
                  <XCircle className="w-4 h-4 mr-2 text-error-red" />
                  Close Complaint
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      <ConfirmationDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        onConfirm={handleCloseComplaint}
        title="Close Complaint"
        message="Are you sure you want to close this complaint? This action will be logged."
        confirmLabel="Confirm"
        variant="danger"
      />

      <StaffSelectionModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
        // @ts-ignore - Fixing type mismatch for staff_code null vs undefined
        staffList={staffList.map(s => ({...s, staff_code: s.staff_code || undefined}))}
        complaintTitle={complaint.title}
        mode={isAssigned ? "reassign" : "assign"}
        currentStaff={isAssigned ? { name: currentStaffName } : undefined}
      />
    </>
  );
}