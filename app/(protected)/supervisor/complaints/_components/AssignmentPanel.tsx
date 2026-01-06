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
  AlertCircle,
  Loader2,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    } catch (error: any) {
      toast.error("Failed to load staff list", {
        description: "Please try again later.",
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
        isAssigned ? "Assignment updated" : "Staff assigned successfully"
      );
      setIsModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Assignment Failed", {
        description: error?.message || "Internal database error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="bg-muted/30 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Current Assignment
            </CardTitle>
            {isAssigned && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpenModal}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reassign Staff
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isAssigned ? (
            <div className="p-4 group relative hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage src={assignee?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {assignee?.full_name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground truncate">
                      {assignee?.full_name || "Unknown Staff"}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 bg-green-50 text-green-700 border-green-200"
                    >
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span>{assignee?.staff_code || "ID-PENDING"}</span>
                  </div>

                  {complaint.assigned_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      Assigned{" "}
                      {formatDistanceToNow(new Date(complaint.assigned_at), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-muted/5">
              <div className="h-12 w-12 bg-background rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
                <UserPlus className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Unassigned
              </h4>
              <p className="text-xs text-muted-foreground mb-4 max-w-[180px]">
                This complaint is currently in the queue. Assign staff to begin
                work.
              </p>
              <Button
                onClick={handleOpenModal}
                disabled={isProcessing}
                size="sm"
                className="w-full max-w-[200px]"
              >
                {isProcessing || loadingStaff ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Assign Staff
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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