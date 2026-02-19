"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  RefreshCw,
  MoreHorizontal,
  Briefcase,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { supervisorApi } from "@/features/supervisor";
import { complaintsApi } from "@/features/complaints";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff, StaffProfile } from "@/lib/types/supervisor.types";
import { cn } from "@/lib/utils";

import { StaffSelectionModal } from "@/components/supervisor/modals/StaffSelectionModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const assignee =
    complaint.assigned_staff_user?.profile || complaint.assigned_staff;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<AssignableStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const rawStaff = await supervisorApi.getSupervisedStaff(
        supabase,
        currentSupervisorId
      );

      // Map the raw supervisor API response to the full StaffProfile shape
      // that getSuggestedStaff expects. Fields not returned by the API
      // (last_known_location, last_active_at) are defaulted to null so the
      // ranking helper can handle them gracefully.
      const staff: StaffProfile[] = rawStaff.map((s: any) => ({
        user_id: s.user_id,
        staff_code: s.staff_code || null,
        department_id: s.department_id || null,
        ward_id: s.ward_id || null,
        staff_role: s.role || "staff",
        is_supervisor: s.is_supervisor || false,
        current_workload: s.workload || 0,
        max_concurrent_assignments: s.max_concurrent_assignments || 5,
        performance_rating: s.performance_rating || 0,
        availability_status: (s.availability_status as any) || "available",
        last_known_location: s.last_known_location || null,
        last_active_at: s.last_active_at || null,
        is_active: s.is_active ?? true,
        full_name: s.full_name,
        avatar_url: s.avatar_url ?? undefined,
        role: s.role,
        computedStatus: s.computedStatus,
      }));

      const location = complaint.location_point?.coordinates
        ? {
            lat: complaint.location_point.coordinates[1],
            lng: complaint.location_point.coordinates[0],
          }
        : null;

      const rankedStaff = getSuggestedStaff(staff, location);
      setStaffList(rankedStaff);
    } catch (error: any) {
      toast.error("Network Error", {
        description: "Could not fetch available staff.",
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
    const toastId = toast.loading("Processing Assignment...");

    try {
      const action = isAssigned
        ? complaintsApi.reassignComplaint(
            supabase,
            complaint.id,
            staffId,
            reason || "Operational Reassignment",
            note,
            currentSupervisorId
          )
        : complaintsApi.assignComplaint(
            supabase,
            complaint.id,
            staffId,
            currentSupervisorId,
            note
          );

      await action;

      toast.success(isAssigned ? "Staff Reassigned" : "Deployment Initiated", {
        id: toastId,
        description: `Task assigned to staff ID: ...${staffId.slice(-4)}`,
      });

      setIsModalOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Assignment Failed", {
        id: toastId,
        description: error?.message || "Check your permissions or connection.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="stone-card dark:stone-card-elevated overflow-hidden border-border/40 transition-colors-smooth relative">
        {/* Status Indicator Bar */}
        <div
          className={cn(
            "h-1 w-full absolute top-0 left-0 transition-colors duration-500",
            isAssigned ? "bg-emerald-500" : "bg-amber-500/60"
          )}
        />

        <div className="px-4 py-4 flex items-center justify-between border-b border-border/50 bg-muted/20 dark:bg-dark-surface/40">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80 dark:text-dark-text-secondary">
              Assignment Protocol
            </span>
          </div>

          {isAssigned && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-primary/10 rounded transition-colors text-muted-foreground hover:text-primary">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="dark:bg-dark-surface-elevated border-border/50"
              >
                <DropdownMenuItem
                  onClick={handleOpenModal}
                  className="text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2 text-primary" />
                  Reassign Staff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="p-5">
          {isAssigned ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-md">
                  <AvatarImage
                    src={assignee?.avatar_url || assignee?.profile_photo_url}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                    {assignee?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background dark:bg-dark-midnight p-0.5 rounded-full border border-primary/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-black text-foreground uppercase tracking-tight dark:text-glow truncate">
                    {assignee?.full_name || "Unknown Staff"}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground/60 dark:text-dark-text-tertiary">
                  <span className="bg-muted px-1.5 py-0.5 rounded dark:bg-dark-border-primary">
                    {assignee?.staff_code || "ID-VERIFIED"}
                  </span>
                </div>

                {complaint.assigned_at && (
                  <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Deployed{" "}
                    {formatDistanceToNow(new Date(complaint.assigned_at), {
                      addSuffix: true,
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="h-14 w-14 glass dark:bg-primary/5 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-primary/20 group-hover:border-primary/40 transition-all">
                <UserPlus className="h-6 w-6 text-primary/40" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-2">
                Unassigned Record
              </h4>
              <p className="text-[10px] text-muted-foreground dark:text-dark-text-tertiary leading-relaxed max-w-[220px] mb-5">
                Queue active. This record requires immediate field deployment to
                satisfy SLA requirements.
              </p>
              <Button
                onClick={handleOpenModal}
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.15em] text-[10px] h-9 shadow-lg accent-glow transition-transform hover:scale-[1.02]"
              >
                {isProcessing || loadingStaff ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Initiate Deployment"
                )}
              </Button>
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