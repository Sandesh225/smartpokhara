"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  UserPlus,
  RefreshCw,
  MoreHorizontal,
  Briefcase,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { getSuggestedStaff } from "@/lib/utils/assignment-helpers";
import type { AssignableStaff } from "@/lib/types/supervisor.types";
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

/**
 * MACHHAPUCHHRE MODERN: ASSIGNMENT PANEL
 * Uses 'stone-card' for light mode stability and 'glass' for dark mode depth.
 */
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

      const location = complaint.location_point?.coordinates
        ? {
            lat: complaint.location_point.coordinates[1],
            lng: complaint.location_point.coordinates[0],
          }
        : null;

      const rankedStaff = getSuggestedStaff(staff, location);
      setStaffList(rankedStaff);
    } catch (error: any) {
      toast.error("Failed to load staff list");
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
        isAssigned ? "Assignment Updated" : "Staff Assigned Successfully"
      );
      setIsModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Assignment Failed", { description: error?.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="stone-card dark:stone-card-elevated overflow-hidden border-border/40 transition-colors-smooth relative">
        {/* Subtle top indicator for assignment status */}
        <div
          className={cn(
            "h-1 w-full absolute top-0 left-0",
            isAssigned ? "bg-primary" : "bg-warning-amber/40"
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
                  <AvatarImage src={assignee?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                    {assignee?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background dark:bg-dark-midnight p-0.5 rounded-full border border-primary/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-black text-foreground uppercase tracking-tight dark:text-glow">
                    {assignee?.full_name}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground/60 dark:text-dark-text-tertiary">
                  <span className="bg-muted px-1.5 py-0.5 rounded dark:bg-dark-border-primary">
                    {assignee?.staff_code || "STAFF-PROX"}
                  </span>
                </div>

                {complaint.assigned_at && (
                  <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
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