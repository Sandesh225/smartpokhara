"use client";

import { useState } from "react";
import { UserPlus, UserCheck, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { StaffSelectionModal } from "@/components/supervisor/modals/StaffSelectionModal";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff } from "@/lib/types/supervisor.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AssignmentPanelProps {
  complaint: any;
  currentSupervisorId: string;
}

export function AssignmentPanel({ complaint, currentSupervisorId }: AssignmentPanelProps) {
  const router = useRouter();
  const supabase = createClient(); // Instantiate client
  
  const isAssigned = !!complaint.assigned_staff_id;
  const assignee = complaint.assigned_staff_details || complaint.assigned_staff; // Handle hydrated structure

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<AssignableStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      // FIX: Pass supabase client
      const staff = await supervisorStaffQueries.getSupervisedStaff(supabase, currentSupervisorId);
      
      const location = complaint.location_point && Array.isArray(complaint.location_point.coordinates)
        ? { lat: complaint.location_point.coordinates[1], lng: complaint.location_point.coordinates[0] } 
        : null;

      const rankedStaff = getSuggestedStaff(staff, location);
      setStaffList(rankedStaff);
    } catch (error) {
      toast.error("Failed to load staff list");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleOpenReassign = () => {
    loadStaff();
    setIsReassignModalOpen(true);
  };

  const handleReassign = async (staffId: string, note: string, options: any, reason?: string) => {
    try {
      if (isAssigned) {
        await supervisorComplaintsQueries.reassignComplaint(
          supabase,
          complaint.id,
          staffId,
          reason || "Reassignment",
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
      setIsReassignModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to assign/reassign complaint");
      console.error(error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">Assignment</h3>
          {isAssigned && (
            <button 
              onClick={handleOpenReassign}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Reassign
            </button>
          )}
        </div>

        <div className="p-4">
          {isAssigned ? (
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                  {assignee?.avatar_url ? (
                    <img src={assignee.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    assignee?.full_name?.charAt(0) || "S"
                  )}
                </div>
                {/* Mock Online Status */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {assignee?.full_name || "Assigned Staff"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {assignee?.staff_code || "Staff ID N/A"}
                </p>
                
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <UserCheck className="h-3 w-3" />
                  <span>Assigned {complaint.assigned_at ? formatDistanceToNow(new Date(complaint.assigned_at), { addSuffix: true }) : 'Recently'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <UserPlus className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Unassigned</p>
              <p className="text-xs text-gray-500 mb-4">
                This complaint has not been assigned to any staff member yet.
              </p>
              <button 
                onClick={handleOpenReassign} 
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                Assign Staff
              </button>
            </div>
          )}
        </div>
      </div>

      <StaffSelectionModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        onAssign={handleReassign}
        staffList={staffList}
        complaintTitle={complaint.title}
        mode={isAssigned ? "reassign" : "assign"}
        currentStaff={isAssigned ? { name: assignee?.full_name } : undefined}
      />
    </>
  );
}