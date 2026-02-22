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
    <div className="bg-card rounded-2xl border border-border p-8 bg-grid-pattern relative overflow-hidden shadow-xs">
      <div className="absolute -top-12 -right-12 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Action Center</h3>
          <span
            className={`flex h-3 w-3 rounded-full border-2 border-background shadow-xs ${
              status === "on_duty" ? "bg-success-green animate-pulse" : "bg-muted"
            }`}
          />
        </div>

        {status === "off_duty" ? (
          <div className="bg-muted/50 rounded-xl p-8 text-center border-2 border-dashed border-border group transition-all hover:bg-muted">
            <CheckCircle className="mx-auto text-success-green mb-3 group-hover:scale-110 transition-transform" size={40} />
            <p className="font-black text-xs uppercase tracking-widest text-foreground">Duty Completed</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mt-1 opacity-60">
              Shift ended at {localOutTime ? new Date(localOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "just now"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <button
              onClick={() => handleAttendance(status === "not_checked_in" ? "in" : "out")}
              disabled={loading}
              className={`flex h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                status === "not_checked_in"
                  ? "bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90"
                  : "bg-destructive text-destructive-foreground shadow-destructive/20 hover:bg-destructive/90"
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
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Clocked in: <span className="text-foreground">{new Date(localInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </p>
          )}
          <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-xl border border-border mt-2">
            <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
            <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed tracking-tight">
              Location verified against <strong className="text-foreground">Pokhara Ward Geofence</strong>. All logs are
              timestamped securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}