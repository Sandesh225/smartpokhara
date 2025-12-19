"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus, Filter } from "lucide-react";
import { ComplaintsTableView } from "@/components/supervisor/complaints/ComplaintsTableView";
import { StaffSelectionModal } from "@/components/supervisor/modals/StaffSelectionModal";
import { BulkActionsBar } from "@/components/supervisor/complaints/BulkActionsBar";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { supervisorComplaintsSubscription } from "@/lib/supabase/realtime/supervisor-complaints-subscription";
import { notifyStaffOfAssignment } from "@/lib/utils/notification-helpers";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff } from "@/lib/types/supervisor.types";
import { createClient } from "@/lib/supabase/client";

interface UnassignedQueueProps {
  initialComplaints: any[];
  supervisorId: string;
}

export function UnassignedQueue({ initialComplaints, supervisorId }: UnassignedQueueProps) {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  
  // Staff Data
  const [staffList, setStaffList] = useState<AssignableStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const supabase = createClient();

  // 1. Real-time Updates
  useEffect(() => {
    if (!supervisorComplaintsSubscription.subscribeToUnassignedQueue) return;

    const channel = supervisorComplaintsSubscription.subscribeToUnassignedQueue(
      (newComplaint) => {
        // Optimistic check: In a real app, you might want to double check if this new complaint matches dept
        // For now, rely on RLS on the subscription channel if configured, or just show it
        setComplaints((prev) => [newComplaint, ...prev]);
        toast.info("New unassigned complaint received");
      },
      (removedId) => {
        setComplaints((prev) => prev.filter((c) => c.id !== removedId));
      }
    );
    return () => {
      if (supervisorComplaintsSubscription.unsubscribe) {
        supervisorComplaintsSubscription.unsubscribe(channel);
      }
    };
  }, []);

  // 2. Fetch Staff Logic
  const loadStaffForAssignment = async (complaintId?: string) => {
    setLoadingStaff(true);
    try {
      const staff = await supervisorStaffQueries.getSupervisedStaff(
        supabase,
        supervisorId
      );

      const targetComplaint = complaints.find((c) => c.id === complaintId);
      const location =
        targetComplaint?.location_point &&
        Array.isArray(targetComplaint.location_point.coordinates)
          ? {
              lat: targetComplaint.location_point.coordinates[1],
              lng: targetComplaint.location_point.coordinates[0],
            }
          : null;

      const rankedStaff = getSuggestedStaff(staff || [], location);
      setStaffList(rankedStaff);
    } catch (error) {
      toast.error("Failed to load staff list");
      console.error("Staff load error:", error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const openAssignModal = (complaintId: string) => {
    setActiveComplaintId(complaintId);
    loadStaffForAssignment(complaintId);
    setIsAssignModalOpen(true);
  };

  // 3. Assignment Logic
  const handleAssign = async (staffId: string, note: string, options: any) => {
    if ((!activeComplaintId && selectedIds.length === 0) || !staffId) {
      toast.error("Invalid selection");
      return;
    }

    const idsToAssign = activeComplaintId ? [activeComplaintId] : selectedIds;
    const targetStaff = staffList.find((s) => s.user_id === staffId);

    try {
      if (activeComplaintId) {
        await supervisorComplaintsQueries.assignComplaint(
          supabase,
          activeComplaintId,
          staffId,
          note
        );
      } else {
        await supervisorComplaintsQueries.bulkAssignComplaints(
          supabase,
          selectedIds,
          staffId,
          supervisorId
        );
      }

      // Notifications
      if (targetStaff) {
        idsToAssign.forEach((cid) => {
          const comp = complaints.find((c) => c.id === cid);
          if (comp) {
            notifyStaffOfAssignment(
              {
                id: targetStaff.user_id,
                name: targetStaff.full_name,
                phone: targetStaff.phone,
                email: targetStaff.email,
              },
              {
                id: comp.id,
                tracking_code: comp.tracking_code,
                title: comp.title,
              },
              note
            );
          }
        });
      }

      toast.success(`Assigned to ${targetStaff?.full_name || "Staff"}`);

      // Optimistic Update
      setComplaints((prev) => prev.filter((c) => !idsToAssign.includes(c.id)));
      setSelectedIds([]);
      setActiveComplaintId(null);
      setIsAssignModalOpen(false);
    } catch (error) {
      toast.error("Assignment failed");
      console.error(error);
    }
  };

  // 4. Selection Handlers
  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? complaints.map((c) => c.id) : []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unassigned Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {complaints.length} complaints waiting for assignment
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ComplaintsTableView
          complaints={complaints}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isLoading={false}
          customAction={(id) => (
            <button
              onClick={() => openAssignModal(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Assign
            </button>
          )}
        />
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onAssign={() => {
          setActiveComplaintId(null);
          loadStaffForAssignment();
          setIsAssignModalOpen(true);
        }}
        onPrioritize={() => {}}
        onEscalate={() => {}}
        onResolve={() => {}}
      />

      <StaffSelectionModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
        staffList={staffList}
        complaintTitle={
          activeComplaintId
            ? complaints.find((c) => c.id === activeComplaintId)?.title ||
              "Complaint"
            : `${selectedIds.length} Selected Complaints`
        }
      />
    </div>
  );
}