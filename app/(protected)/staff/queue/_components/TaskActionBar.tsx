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
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
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
        if (geoLocation?.coords) {
          location = {
            lat: geoLocation.coords.latitude,
            lng: geoLocation.coords.longitude,
          };
        }
      } catch (err) {
        console.warn("Location unavailable:", err);
        // Continue without location
      }

      // FIX: Pass location as optional parameter (can be undefined)
      await staffQueueQueries.startAssignment(
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:static lg:bg-transparent lg:border-0 lg:p-0 z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={handleMessageAssignee}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-5 w-5" /> Message Assignee
          </button>
          <button
            onClick={() => toast.info("Help request sent to supervisor")}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 py-3 rounded-xl font-bold hover:bg-orange-100 transition-colors"
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:static lg:bg-transparent lg:border-0 lg:p-0 z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          {showStart ? (
            <button
              onClick={handleStartWork}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
                <div className="w-full py-3 bg-green-50 text-green-700 text-center font-bold rounded-xl border border-green-200">
                  Work Completed ✓
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddLog}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    <PlusSquare className="h-5 w-5" /> Log Update
                  </button>
                  <button
                    onClick={() => setIsCompleteModalOpen(true)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm"
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