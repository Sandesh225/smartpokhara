"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Printer, MoreVertical, RefreshCw, UserPlus } from "lucide-react";
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

interface ComplaintDetailHeaderProps {
  complaint: any;
  userId: string;
}

export function ComplaintDetailHeader({ complaint, userId }: ComplaintDetailHeaderProps) {
  const router = useRouter();
  const supabase = createClient(); // Instantiate client here
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  
  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<AssignableStaff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Check if currently assigned
  const isAssigned = !!complaint.assigned_staff_id;
  const currentStaffName = complaint.assigned_staff?.full_name || complaint.assigned_staff?.profile?.full_name;

  const handleCloseComplaint = async () => {
    try {
      await supervisorComplaintsQueries.closeComplaint(supabase, complaint.id, "Closed via header action");
      toast.success("Complaint closed successfully");
      setIsCloseDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to close complaint");
    }
  };

  // 1. Load Staff Data
  const loadStaffForAssignment = async () => {
    setIsLoadingStaff(true);
    try {
      // FIX: Pass supabase client
      const staff = await supervisorStaffQueries.getSupervisedStaff(supabase, userId);
      
      const location = complaint.location_point && Array.isArray(complaint.location_point.coordinates)
        ? { lat: complaint.location_point.coordinates[1], lng: complaint.location_point.coordinates[0] } 
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

  // 2. Handle Assignment
  const handleAssign = async (staffId: string, note: string, options: any, reason?: string) => {
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
        await supervisorComplaintsQueries.assignComplaint(supabase, complaint.id, staffId, note);
        toast.success("Complaint assigned successfully");
      }
      setIsAssignModalOpen(false);
      router.refresh(); // Refresh page to show new state
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign staff");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: ID & Status */}
          <div className="flex items-start gap-4">
            <Link 
              href="/supervisor/complaints"
              className="mt-1 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {complaint.tracking_code}
                </h1>
                <StatusBadge status={complaint.status} variant="complaint" />
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                {/* Fixed Hydration Error */}
                <span>Submitted {format(new Date(complaint.submitted_at), "dd/MM/yyyy")}</span>
                <span>•</span>
                <PriorityIndicator priority={complaint.priority} size="sm" />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Print"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-1" />

            <button 
              className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={loadStaffForAssignment}
              disabled={isLoadingStaff}
            >
              {isLoadingStaff ? (
                "Loading..."
              ) : isAssigned ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" /> Reassign
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" /> Assign Staff
                </>
              )}
            </button>

            <button
              className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
              onClick={() => setIsCloseDialogOpen(true)}
            >
              Close
            </button>

            {/* Mobile Menu */}
            <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Close */}
      <ConfirmationDialog 
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        onConfirm={handleCloseComplaint}
        title="Close Complaint"
        message="Are you sure you want to close this complaint? This action cannot be undone immediately."
        confirmLabel="Close Complaint"
        variant="danger"
      />

      {/* Staff Assignment Modal */}
      <StaffSelectionModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
        staffList={staffList}
        complaintTitle={complaint.title}
        mode={isAssigned ? "reassign" : "assign"}
        currentStaff={isAssigned ? { name: currentStaffName || "Current Staff" } : undefined}
      />
    </div>
  );
}