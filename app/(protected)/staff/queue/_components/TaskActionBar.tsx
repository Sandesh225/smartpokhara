"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  PlusSquare,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff";
import { getCurrentLocation } from "@/lib/utils/location-helpers";
import { MarkCompleteModal } from "@/components/staff/modals/MarkCompleteModal";

interface TaskActionBarProps {
  assignmentId: string;
  status: string;
  isAssignee: boolean;
  assigneeId?: string;
  staffId?: string;
}

export function TaskActionBar({
  assignmentId,
  status,
  isAssignee,
  assigneeId,
  staffId,
}: TaskActionBarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const handleStartWork = async () => {
    setIsLoading(true);
    try {
      let location = null;
      try {
        // Attempt to get location, but don't block work if it fails
        const geoLocation = await getCurrentLocation();

        // FIX: Safely extract coordinates
        if (geoLocation) {
          location = {
            lat: geoLocation.lat,
            lng: geoLocation.lng,
          };
        }
      } catch (err) {
        console.warn("Location unavailable:", err);
        // Continue without location
      }

      // FIX: Pass location as optional parameter (can be undefined)
      await staffApi.startAssignment(
        supabase,
        assignmentId,
        location || undefined
      );

      toast.success("Work started successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Start Work Failed:", error);

      // Better error message extraction
      const errorMessage =
        error?.message ||
        error?.error_description ||
        (typeof error === "string" ? error : "Database connection error");

      toast.error("Process Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLog = () => {
    toast.info("Add Log feature coming next");
  };

  const handleMessageAssignee = () => {
    if (!assigneeId) return toast.error("Assignee information unavailable");
    router.push(`/staff/messages/new?recipient=${assigneeId}`);
  };

  // 1. Team View (If NOT Assigned to Me)
  if (!isAssignee) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4 lg:static lg:bg-transparent lg:border-0 lg:p-0 z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={handleMessageAssignee}
            className="flex-1 flex items-center justify-center gap-2 bg-card border border-border text-foreground py-3 rounded-xl font-bold hover:bg-muted transition-all active:scale-95 shadow-xs"
          >
            <MessageSquare className="h-5 w-5" /> Message Assignee
          </button>
          <button
            onClick={() => toast.info("Help request sent to supervisor")}
            className="flex-1 flex items-center justify-center gap-2 bg-warning-amber/10 text-warning-amber border border-warning-amber/20 py-3 rounded-xl font-bold hover:bg-warning-amber/20 transition-all active:scale-95 shadow-xs"
          >
            <ShieldAlert className="h-5 w-5" /> Request Help
          </button>
        </div>
      </div>
    );
  }

  // 2. Assignee View (Active Controls)
  const normalizedStatus = status?.toLowerCase() || "not_started";
  const showStart =
    normalizedStatus === "not_started" || normalizedStatus === "paused";

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4 lg:static lg:bg-transparent lg:border-0 lg:p-0 z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          {showStart ? (
            <button
              onClick={handleStartWork}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
              Start Work
            </button>
          ) : (
            <>
              {normalizedStatus === "completed" ||
              normalizedStatus === "awaiting_approval" ? (
                <div className="w-full py-3 bg-success-green/10 text-success-green text-center font-bold rounded-xl border border-success-green/20">
                  Work Completed ✓
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddLog}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-card border border-border text-foreground py-3 rounded-xl font-bold hover:bg-muted transition-all active:scale-95 shadow-xs"
                  >
                    <PlusSquare className="h-5 w-5" /> Log Update
                  </button>
                   <button
                    onClick={() => setIsCompleteModalOpen(true)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-success-green text-white py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shadow-success-green/20 active:scale-95"
                  >
                    <CheckCircle2 className="h-5 w-5" /> Complete
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <MarkCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        assignmentId={assignmentId}
        staffId={staffId}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}