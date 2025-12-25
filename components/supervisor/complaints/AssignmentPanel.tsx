"use client";

import { useState } from "react";
import {
  UserPlus,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { StaffSelectionModal } from "@/components/supervisor/modals/StaffSelectionModal";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff } from "@/lib/types/supervisor.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AssignmentPanelProps {
  complaint: any;
  currentSupervisorId: string;
}

export function AssignmentPanel({
  complaint,
  currentSupervisorId,
}: AssignmentPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const isAssigned = !!complaint.assigned_staff_id;
  const assignee = complaint.assigned_staff;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<AssignableStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

const loadStaff = async () => {
  setLoadingStaff(true);
  try {
    const staff = await supervisorStaffQueries.getSupervisedStaff(
      supabase,
      currentSupervisorId
    );
    console.log("DEBUG: Staff received in Panel:", staff);

    const location = complaint.location_point?.coordinates
      ? {
          lat: complaint.location_point.coordinates[1],
          lng: complaint.location_point.coordinates[0],
        }
      : null;

    const rankedStaff = getSuggestedStaff(staff, location);
    setStaffList(rankedStaff);
  } catch (error: any) {
    toast.error("Cloud Sync Error", {
      description: "Failed to load team list.",
    });
  } finally {
    setLoadingStaff(false);
  }
};

  const handleOpenModal = () => {
    loadStaff();
    setIsModalOpen(true);
  };

  const handleAssignAction = async (
    staffId: string,
    note: string,
    options: any,
    reason?: string
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Determine if this is a first-time assignment or a change in staff
      const action = isAssigned
        ? supervisorComplaintsQueries.reassignComplaint(
            supabase,
            complaint.id,
            staffId,
            reason || "Operational Reassignment",
            note,
            currentSupervisorId
          )
        : supervisorComplaintsQueries.assignComplaint(
            supabase,
            complaint.id,
            staffId,
            note,
            currentSupervisorId
          );

      await action;

      toast.success(
        isAssigned ? "Assignment re-routed" : "Staff assigned successfully"
      );
      setIsModalOpen(false);

      // Force refresh server component to reflect new assignee
      router.refresh();
    } catch (error: any) {
      // FIXED: Stringify error to avoid empty {} message in console/toasts
      const errorMessage = error?.message || "Internal database error";

      console.error("Assignment Execution Error:", {
        message: errorMessage,
        raw: error,
      });

      // Special handling for the technical engineering jurisdiction trigger in SQL
      if (errorMessage.includes("technical engineering")) {
        toast.error("Jurisdiction Conflict", {
          description:
            "Ward Supervisors cannot dispatch technical department agents.",
        });
      } else {
        toast.error("Assignment Failed", {
          description: errorMessage,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">
            Assignment Control
          </h3>
          {isAssigned && (
            <button
              onClick={handleOpenModal}
              disabled={isProcessing}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3",
                  (loadingStaff || isProcessing) && "animate-spin"
                )}
              />
              Reassign
            </button>
          )}
        </div>

        <div className="p-4">
          {isAssigned ? (
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold overflow-hidden border border-slate-200 shadow-inner">
                  {assignee?.avatar_url ? (
                    <img
                      src={assignee.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    assignee?.full_name?.charAt(0) || "S"
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {assignee?.full_name || "Assigned Staff"}
                </p>
                <p className="text-xs text-gray-500 truncate font-mono">
                  {assignee?.staff_code || "AGENT-ID-PENDING"}
                </p>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                  <UserCheck className="h-3 w-3" />
                  <span>
                    Assigned{" "}
                    {complaint.assigned_at
                      ? formatDistanceToNow(new Date(complaint.assigned_at), {
                          addSuffix: true,
                        })
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-500 border border-blue-100">
                <UserPlus className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                Queue Empty
              </p>
              <p className="text-xs text-gray-500 mb-5 max-w-[200px] mx-auto leading-relaxed">
                No staff member is currently handling this complaint. Dispatch
                an agent to begin resolution.
              </p>
              <button
                onClick={handleOpenModal}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Assign Staff"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <StaffSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleAssignAction}
        staffList={staffList}
        complaintTitle={complaint.title}
        mode={isAssigned ? "reassign" : "assign"}
        currentStaff={isAssigned ? { name: assignee?.full_name } : undefined}
      />
    </>
  );
}