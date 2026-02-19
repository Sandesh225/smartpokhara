// app/(protected)/staff/attendance/_components/CheckInOutPanel.tsx

"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, LogOut, CheckCircle, Loader2 } from "lucide-react";
import { staffApi } from "@/features/staff";
import { createClient } from "@/lib/supabase/client"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

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

  const [status, setStatus] = useState(initialStatus);
  const [localInTime, setLocalInTime] = useState(checkInTime);
  const [localOutTime, setLocalOutTime] = useState(checkOutTime);

  useEffect(() => {
    setStatus(initialStatus);
    setLocalInTime(checkInTime);
    setLocalOutTime(checkOutTime);
  }, [initialStatus, checkInTime, checkOutTime]);

  const handleAttendance = async (type: "in" | "out") => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          if (type === "in") {
            await staffApi.checkIn(supabase, latitude, longitude, "browser-id");
            setStatus("on_duty");
            setLocalInTime(new Date().toISOString());
            toast.success("Namaste! Check-in successful.");
          } else {
            await staffApi.checkOut(supabase, latitude, longitude);
            setStatus("off_duty");
            setLocalOutTime(new Date().toISOString());
            toast.success("Work completed. Have a safe journey home!");
          }

          router.refresh();
        } catch (error: any) {
          // If the DB throws ALREADY_COMPLETED, it means they clicked multiple times or the UI got out of sync
          if (error.message === "ALREADY_COMPLETED") {
             setStatus("off_duty");
             toast.info("Your shift is already completed.");
          } else {
             toast.error(error.message || "Attendance update failed");
          }
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
      <div className="absolute -top-12 -right-12 h-32 w-32 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Action Center</h3>
          <span
            className={`flex h-3 w-3 rounded-full ${
              status === "on_duty" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
            }`}
          />
        </div>

        {status === "off_duty" ? (
          <div className="bg-muted/50 rounded-xl p-6 text-center border-2 border-dashed border-border">
            <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
            <p className="font-bold text-sm">Duty Completed</p>
            <p className="text-xs text-muted-foreground mt-1">
              Shift ended at {localOutTime ? new Date(localOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "just now"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <button
              onClick={() => handleAttendance(status === "not_checked_in" ? "in" : "out")}
              disabled={loading}
              className={`btn-gov h-24 flex-col gap-2 text-lg shadow-lg transition-all active:scale-95 ${
                status === "not_checked_in"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={28} />
              ) : status === "not_checked_in" ? (
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

        <div className="flex flex-col gap-2">
          {localInTime && status !== "not_checked_in" && (
            <p className="text-xs font-medium text-muted-foreground">
              Clocked in at: <span className="font-bold text-foreground">{new Date(localInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </p>
          )}
          <div className="flex items-start gap-3 text-xs text-muted-foreground bg-background/50 p-4 rounded-lg border border-border">
            <MapPin size={14} className="mt-0.5 text-primary shrink-0" />
            <p>
              Your location is verified against the <strong>Pokhara Ward Office</strong> geofence. All logs are
              timestamped securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}