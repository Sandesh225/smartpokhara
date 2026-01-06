"use client";

import { useState, useTransition } from "react";
import { LogIn, LogOut, MapPin, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staffAttendanceQueries } from "@/lib/supabase/queries/staff-attendance";
import { getCurrentLocation } from "@/lib/utils/location-helpers";
import { useRouter } from "next/navigation";

interface Props {
  initialStatus: "not_checked_in" | "on_duty" | "off_duty";
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

export function CheckInOutPanel({
  initialStatus,
  checkInTime,
  checkOutTime,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  // Use local state for immediate feedback
  const [localCheckIn, setLocalCheckIn] = useState<string | null | undefined>(checkInTime);
  const [localCheckOut, setLocalCheckOut] = useState<string | null | undefined>(checkOutTime);

  const supabase = createClient();

  const handleAction = async (action: "check-in" | "check-out") => {
    setLoading(true);
    const toastId = toast.loading(
      action === "check-in" ? "Acquiring location..." : "Finalizing shift..."
    );

    try {
      const location = await getCurrentLocation();

      if (!location) {
        toast.message("Location unavailable", {
          description: "Proceeding without GPS tag.",
        });
      }

      if (action === "check-in") {
        toast.loading("Clocking in...", { id: toastId });
        await staffAttendanceQueries.checkIn(supabase, location || undefined);

        const now = new Date().toISOString();
        setStatus("on_duty");
        setLocalCheckIn(now);
        toast.success("Checked in successfully", { id: toastId });
      } else {
        toast.loading("Clocking out...", { id: toastId });
        await staffAttendanceQueries.checkOut(supabase, location || undefined);

        const now = new Date().toISOString();
        setStatus("off_duty");
        setLocalCheckOut(now);
        toast.success("Checked out successfully", { id: toastId });
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      console.error("Attendance Error:", error);
      const msg = error.message || "";

      // --- ERROR HANDLING LOGIC ---
      
      // 1. Handle "No active check-in" error (Self-Healing)
      if (msg.includes("No active check-in")) {
        setStatus("not_checked_in");
        toast.error("Session sync error. Resetting status.", { id: toastId });
        startTransition(() => router.refresh());
        return;
      }

      // 2. Handle DB Logic Codes
      if (msg === "ALREADY_COMPLETED") {
        setStatus("off_duty");
        toast.info("Shift already marked as complete.", { id: toastId });
        startTransition(() => router.refresh());
      } else if (msg === "ALREADY_ON_DUTY") {
        setStatus("on_duty");
        if (!localCheckIn) setLocalCheckIn(new Date().toISOString());
        toast.info("You are already checked in.", { id: toastId });
        startTransition(() => router.refresh());
      } else {
        // Generic Error
        toast.error(msg || "Action failed", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  const isProcessing = loading || isPending;

  return (
    <div className="stone-card bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative min-h-[340px] flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-gray-900">
        <MapPin className="w-48 h-48" />
      </div>

      <div className="p-6 relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Action Center</h3>
          {status === "on_duty" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                Live
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {/* STATE 1: NOT CHECKED IN */}
          {status === "not_checked_in" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-sm text-blue-700 leading-relaxed">
                <p>
                  Ready to start your day? Ensure you are at your assigned
                  location before punching in.
                </p>
              </div>
              <button
                onClick={() => handleAction("check-in")}
                disabled={isProcessing}
                className="w-full py-5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <LogIn className="w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-lg tracking-wide">PUNCH IN</span>
              </button>
            </div>
          )}

          {/* STATE 2: ON DUTY */}
          {status === "on_duty" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center justify-center py-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Shift Started
                </span>
                <span className="text-5xl font-mono font-bold text-gray-900 tracking-tight tabular-nums">
                  {localCheckIn
                    ? format(new Date(localCheckIn), "HH:mm")
                    : "--:--"}
                </span>
                <span className="text-xs font-medium text-gray-400 mt-2 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                  NPT (Local Time)
                </span>
              </div>

              <button
                onClick={() => handleAction("check-out")}
                disabled={isProcessing}
                className="w-full py-5 bg-white border-2 border-red-50 text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 group shadow-sm hover:shadow-md"
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                )}
                <span>PUNCH OUT</span>
              </button>
            </div>
          )}

          {/* STATE 3: OFF DUTY */}
          {status === "off_duty" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-100">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">Day Complete!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Great job today. See you tomorrow.
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-px bg-gray-100 rounded-xl overflow-hidden mt-2 border border-gray-200">
                <div className="bg-white p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Clock In
                  </p>
                  <p className="font-mono font-bold text-gray-700 text-sm">
                    {localCheckIn
                      ? format(new Date(localCheckIn), "HH:mm")
                      : "--"}
                  </p>
                </div>
                <div className="bg-white p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Clock Out
                  </p>
                  <p className="font-mono font-bold text-gray-700 text-sm">
                    {localCheckOut
                      ? format(new Date(localCheckOut), "HH:mm")
                      : "--"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}