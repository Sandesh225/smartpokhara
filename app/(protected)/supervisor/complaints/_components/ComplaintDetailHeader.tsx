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
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmationDialog } from "@/components/supervisor/shared/ConfirmationDialog";
import { UniversalAssignmentModal } from "@/components/supervisor/modals/UniversalAssignmentModal";
import { supervisorApi } from "@/features/supervisor";
import { complaintsApi } from "@/features/complaints";
import { getSuggestedStaff } from "@/lib/utils/complaint-logic";
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

  const metadata = (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="truncate">
        {format(new Date(complaint.submitted_at), "MMM d, yyyy")}
      </span>
      <span className="text-border">•</span>
      <PriorityIndicator priority={complaint.priority} size="sm" />
    </div>
  );

  const actions = (
    <>
      <div className="hidden lg:flex items-center gap-1 px-3 border-r border-border">
        {[Printer, Share2, Download].map((Icon, i) => (
          <Button
            key={i}
            variant="ghost"
            size="icon-sm"
            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCloseDialogOpen(true)}
        className="hidden sm:flex h-10 px-4 rounded-lg font-semibold border-error-red/30 text-error-red hover:bg-error-red/10 transition-all text-sm"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Close
      </Button>

      <Button
        size="sm"
        onClick={loadStaffForAssignment}
        disabled={isLoadingStaff}
        className={cn(
          "h-10 px-4 sm:px-6 rounded-lg font-semibold shadow-sm transition-all text-sm",
          isAssigned
            ? "bg-warning-amber hover:bg-warning-amber/90"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
      >
        {isLoadingStaff ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {isAssigned ? (
              <RefreshCw className="w-4 h-4 sm:mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">
              {isAssigned ? "Redeploy" : "Deploy"}
            </span>
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsCloseDialogOpen(true)}>
            <XCircle className="w-4 h-4 mr-2 text-error-red" />
            Close Complaint
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {[
            { icon: Printer, label: "Print" },
            { icon: Share2, label: "Share" },
            { icon: Download, label: "Download" },
          ].map((item, i) => (
            <DropdownMenuItem key={i}>
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <>
      <PageHeader
        backHref="/supervisor/complaints"
        title={
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-black text-foreground tracking-tighter truncate leading-none">
              {complaint.tracking_code}
            </h1>
            <StatusBadge status={complaint.status} />
          </div>
        }
        badge={
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-xs font-black text-primary uppercase tracking-wider">
            <Command className="w-3 h-3" />
            Ledger
          </span>
        }
        metadata={metadata}
        actions={actions}
      />

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

      <UniversalAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssign}
        staffList={staffList.map(s => ({
            ...s, 
            full_name: s.full_name || "Unknown Staff",
            staff_code: s.staff_code || undefined
        }))}
        complaintTitle={complaint.title}
        isReassign={isAssigned}
        currentStaffName={currentStaffName}
      />
    </>
  );
}