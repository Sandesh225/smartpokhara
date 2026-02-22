"use client";

import { useState, useTransition } from "react";
import { MapPin, Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff";
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
        await staffApi.checkIn(supabase, coords?.lat || 0, coords?.lng || 0);
        toast.success("Checked in successfully", { id: toastId });
      } else {
        toast.loading("Clocking out...", { id: toastId });
        await staffApi.checkOut(supabase, coords?.lat || 0, coords?.lng || 0);
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
    <div className="bg-card rounded-xl border border-border shadow-xs p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-widest">
            <Clock className="w-4 h-4 text-info-blue" />
            Attendance Today
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 ml-6">
            {format(new Date(), "EEEE, d MMMM")}
          </p>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-current/10 ${
            status === "on_duty"
              ? "bg-success-green/10 text-success-green"
              : status === "off_duty"
              ? "bg-muted text-muted-foreground"
              : "bg-info-blue/10 text-info-blue"
          }`}
        >
          {status === "on_duty" && (
            <span className="w-2 h-2 bg-success-green rounded-full mr-2 animate-pulse" />
          )}
          {status === "not_checked_in"
            ? "Pending"
            : status === "on_duty"
            ? "Active"
            : "Completed"}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Action Buttons */}
        {status === "not_checked_in" && (
          <button
            onClick={() => handleAction("check-in")}
            disabled={isProcessing}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>Clock In Now</span>
          </button>
        )}

        {status === "on_duty" && (
          <div className="flex items-center justify-between bg-muted/50 p-4 rounded-xl border border-border">
            <div className="text-left">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                Started
              </p>
              <p className="font-mono font-black text-foreground text-xl tracking-tighter">
                {checkInTime
                  ? format(new Date(checkInTime), "h:mm a")
                  : "--:--"}
              </p>
            </div>
            <button
              onClick={() => handleAction("check-out")}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl font-black uppercase tracking-widest text-xs hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Out
            </button>
          </div>
        )}

        {/* Summary Info (Visible if checked in or completed) */}
        {(checkInTime || location) && (
          <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {checkInTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-info-blue" />
                <span>
                  In:{" "}
                  <span className="text-foreground">
                    {format(new Date(checkInTime), "h:mm a")}
                  </span>
                </span>
              </div>
            )}
            {checkOutTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-destructive/70" />
                <span>
                  Out:{" "}
                  <span className="text-foreground">
                    {format(new Date(checkOutTime), "h:mm a")}
                  </span>
                </span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="truncate max-w-[140px] lowercase">{location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}