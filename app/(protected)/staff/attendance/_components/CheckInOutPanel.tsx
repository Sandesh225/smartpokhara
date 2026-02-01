"use client";

import { useState } from "react";
import { MapPin, Clock, LogOut, CheckCircle, Loader2 } from "lucide-react";
import { staffAttendanceQueries } from "@/lib/supabase/queries/staff-attendance";
import { createClient } from "@/lib/supabase/client"; // Client-side supabase
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner for notifications

interface Props {
  initialStatus: "not_checked_in" | "on_duty" | "off_duty";
  checkInTime?: string;
  checkOutTime?: string;
}

export function CheckInOutPanel({
  initialStatus,
  checkInTime,
  checkOutTime,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

const handleAttendance = async (type: "in" | "out") => {
  setLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        if (type === "in") {
          // Pass all three required arguments
          await staffAttendanceQueries.checkIn(
            supabase,
            latitude,
            longitude,
            "browser-id" // This maps to p_device_id
          );
          toast.success("Namaste! Check-in successful.");
        } else {
          await staffAttendanceQueries.checkOut(supabase, latitude, longitude);
          toast.success("Work completed. Have a safe journey home!");
        }

        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Attendance update failed");
      } finally {
        setLoading(false);
      }
    },
    (error) => {
      toast.error("Please enable location to record attendance.");
      setLoading(false);
    },
    { enableHighAccuracy: true }
  );
};

  return (
    <div className="stone-card p-8 bg-grid-pattern relative overflow-hidden">
      {/* Decorative Background for Modern Look */}
      <div className="absolute -top-12 -right-12 h-32 w-32 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Action Center</h3>
          <span
            className={`flex h-3 w-3 rounded-full ${initialStatus === "on_duty" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
          />
        </div>

        {initialStatus === "off_duty" ? (
          <div className="bg-muted/50 rounded-xl p-6 text-center border-2 border-dashed border-border">
            <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
            <p className="font-bold text-sm">Duty Completed</p>
            <p className="text-xs text-muted-foreground mt-1">
              Shift ended at {new Date(checkOutTime!).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <button
              onClick={() =>
                handleAttendance(
                  initialStatus === "not_checked_in" ? "in" : "out"
                )
              }
              disabled={loading}
              className={`btn-gov h-24 flex-col gap-2 text-lg shadow-lg transition-all active:scale-95 ${
                initialStatus === "not_checked_in"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={28} />
              ) : initialStatus === "not_checked_in" ? (
                <>
                  <Clock size={28} />
                  <span>Check In</span>
                </>
              ) : (
                <>
                  <LogOut size={28} />
                  <span>Check Out</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex items-start gap-3 text-xs text-muted-foreground bg-background/50 p-4 rounded-lg border border-border">
          <MapPin size={14} className="mt-0.5 text-primary" />
          <p>
            Your location is verified against the{" "}
            <strong>Pokhara Ward Office</strong> geofence. All logs are
            timestamped in UTC+5:45.
          </p>
        </div>
      </div>
    </div>
  );
}
