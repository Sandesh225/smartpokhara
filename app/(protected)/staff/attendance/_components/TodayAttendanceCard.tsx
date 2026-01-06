"use client";

import { useState, useTransition } from "react";
import { MapPin, Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffAttendanceQueries } from "@/lib/supabase/queries/staff-attendance";
import { getCurrentLocation } from "@/lib/utils/location-helpers";

interface Props {
  status: "not_checked_in" | "on_duty" | "off_duty";
  checkInTime?: string | null;
  checkOutTime?: string | null;
  location?: string | null;
}

export function TodayAttendanceCard({
  status,
  checkInTime,
  checkOutTime,
  location,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAction = async (action: "check-in" | "check-out") => {
    setLoading(true);
    const toastId = toast.loading(
      action === "check-in" ? "Acquiring location..." : "Finalizing shift..."
    );

    try {
      // 1. Get Location
      const coords = await getCurrentLocation();

      if (!coords) {
        toast.warning("Location unavailable. checking in without GPS tag.");
      }

      // 2. Database Action
      if (action === "check-in") {
        toast.loading("Clocking in...", { id: toastId });
        await staffAttendanceQueries.checkIn(supabase, coords || undefined);
        toast.success("Checked in successfully", { id: toastId });
      } else {
        toast.loading("Clocking out...", { id: toastId });
        await staffAttendanceQueries.checkOut(supabase, coords || undefined);
        toast.success("Checked out successfully", { id: toastId });
      }

      // 3. Refresh UI
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      console.error(error);
      const msg = error.message;

      // Handle specific logic errors gracefully
      if (msg === "ALREADY_ON_DUTY" || msg === "ALREADY_COMPLETED") {
        toast.info("Status updated from server.", { id: toastId });
        startTransition(() => router.refresh());
      } else {
        toast.error(msg || "Action failed", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  const isProcessing = loading || isPending;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Today's Attendance
          </h2>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            {format(new Date(), "EEEE, d MMMM")}
          </p>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            status === "on_duty"
              ? "bg-green-50 text-green-700 border-green-200"
              : status === "off_duty"
              ? "bg-gray-50 text-gray-600 border-gray-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {status === "on_duty" && (
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          )}
          {status === "not_checked_in"
            ? "Not Checked In"
            : status === "on_duty"
            ? "On Duty"
            : "Shift Completed"}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Action Buttons */}
        {status === "not_checked_in" && (
          <button
            onClick={() => handleAction("check-in")}
            disabled={isProcessing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>Check In Now</span>
          </button>
        )}

        {status === "on_duty" && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="text-left">
              <p className="text-[10px] text-gray-500 uppercase font-bold">
                Started
              </p>
              <p className="font-mono font-bold text-gray-900 text-lg">
                {checkInTime
                  ? format(new Date(checkInTime), "h:mm a")
                  : "--:--"}
              </p>
            </div>
            <button
              onClick={() => handleAction("check-out")}
              disabled={isProcessing}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Check Out
            </button>
          </div>
        )}

        {/* Summary Info (Visible if checked in or completed) */}
        {(checkInTime || location) && (
          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-600">
            {checkInTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  In:{" "}
                  <span className="font-medium text-gray-900">
                    {format(new Date(checkInTime), "h:mm a")}
                  </span>
                </span>
              </div>
            )}
            {checkOutTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Out:{" "}
                  <span className="font-medium text-gray-900">
                    {format(new Date(checkOutTime), "h:mm a")}
                  </span>
                </span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate max-w-[150px]">{location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}