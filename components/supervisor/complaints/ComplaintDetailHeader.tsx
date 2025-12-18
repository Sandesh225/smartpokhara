"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Printer,
  MoreVertical,
  RefreshCw,
  UserPlus,
  Download,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { ConfirmationDialog } from "@/components/supervisor/shared/ConfirmationDialog";
import { StaffSelectionModal } from "@/components/supervisor/modals/StaffSelectionModal";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff } from "@/lib/types/supervisor.types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ComplaintDetailHeaderProps {
  complaint: any;
  userId: string;
}

export function ComplaintDetailHeader({
  complaint,
  userId,
}: ComplaintDetailHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<AssignableStaff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const isAssigned = !!complaint.assigned_staff_id;
  const currentStaffName =
    complaint.assigned_staff?.full_name ||
    complaint.assigned_staff?.profile?.full_name;

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

      const location =
        complaint.location_point &&
        Array.isArray(complaint.location_point.coordinates)
          ? {
              lat: complaint.location_point.coordinates[1],
              lng: complaint.location_point.coordinates[0],
            }
          : null;

      const rankedStaff = getSuggestedStaff(staff, location);
      setStaffList(rankedStaff);
      setIsAssignModalOpen(true);
    } catch (error) {
      console.error(error);
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
          reason || "Reassignment via header",
          note
        );
        toast.success("Complaint reassigned successfully");
      } else {
        await supervisorComplaintsQueries.assignComplaint(
          supabase,
          complaint.id,
          staffId,
          note
        );
        toast.success("Complaint assigned successfully");
      }
      setIsAssignModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign staff");
    }
  };

  return (
    <div className="bg-linear-to-r from-white via-gray-50/50 to-white border-b border-gray-200 shadow-sm sticky top-16 z-30 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Navigation, ID & Status */}
          <div className="flex items-start gap-4">
            <Link
              href="/supervisor/complaints"
              className="mt-1.5 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Back to complaints list"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {complaint.tracking_code}
                </h1>
                <StatusBadge status={complaint.status} variant="complaint" />
                <PriorityIndicator priority={complaint.priority} size="md" />
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  Submitted{" "}
                  {format(
                    new Date(complaint.submitted_at),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
                {isAssigned && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                      <UserPlus className="w-3.5 h-3.5" />
                      {currentStaffName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {/* Quick Actions - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-gray-600 hover:text-gray-900"
                aria-label="Print complaint"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-gray-600 hover:text-gray-900"
                aria-label="Share complaint"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-gray-600 hover:text-gray-900"
                aria-label="Download report"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block" />

            {/* Primary Actions */}
            <Button
              onClick={loadStaffForAssignment}
              disabled={isLoadingStaff}
              size="sm"
              className="h-9 font-semibold shadow-sm hidden sm:inline-flex"
              variant={isAssigned ? "outline" : "default"}
            >
              {isLoadingStaff ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isAssigned ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reassign
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Staff
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCloseDialogOpen(true)}
              className="h-9 font-semibold hidden sm:inline-flex"
            >
              Close Complaint
            </Button>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 sm:hidden"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={loadStaffForAssignment}
                  disabled={isLoadingStaff}
                >
                  {isAssigned ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reassign Staff
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Staff
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCloseDialogOpen(true)}>
                  Close Complaint
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        onConfirm={handleCloseComplaint}
        title="Close Complaint"
        message="Are you sure you want to close this complaint? This action cannot be undone immediately."
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
        currentStaff={
          isAssigned ? { name: currentStaffName || "Current Staff" } : undefined
        }
      />
    </div>
  );
}