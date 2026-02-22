"use client";

import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { format, parseISO, differenceInHours } from "date-fns";
import { AlertCircle, Timer, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SLATrackerProps {
  deadline?: string | null;
  status: string;
  createdAt: string;
}

export function SLATracker({ deadline, status, createdAt }: SLATrackerProps) {
  const isResolved = ["resolved", "closed"].includes(status.toLowerCase());

  // Memoized Urgency Calculation
  const urgency = useMemo(() => {
    if (isResolved) return "complete";
    if (!deadline) return "stable";
    try {
      const hoursLeft = differenceInHours(parseISO(deadline), new Date());
      if (hoursLeft <= 12) return "critical";
      if (hoursLeft <= 48) return "warning";
      return "stable";
    } catch {
      return "stable";
    }
  }, [deadline, isResolved]);

  const isCritical = urgency === "critical";

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl shadow-xs overflow-hidden transition-all duration-300 relative group",
        isCritical && "ring-2 ring-destructive/30 shadow-md"
      )}
    >
      {/* STATUS BADGE */}
      <div
        className={cn(
          "absolute top-0 right-0 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-bl-xl shadow-sm z-10 transition-colors",
          urgency === "complete" && "bg-success-green text-white",
          urgency === "critical" && "bg-error-red text-white animate-pulse",
          urgency === "warning" && "bg-warning-amber text-white",
          urgency === "stable" && "bg-primary text-primary-foreground"
        )}
      >
        {isResolved ? "Complete" : isCritical ? "Critical" : "Active"}
      </div>

      {/* HEADER */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer
            className={cn(
              "h-4 w-4",
              isCritical ? "text-error-red" : "text-foreground/70"
            )}
          />
          <h3 className="text-sm font-bold text-foreground">
            SLA Monitor
          </h3>
        </div>
        {isCritical && (
          <Zap className="h-4 w-4 text-error-red animate-bounce" />
        )}
      </div>

      <div className="p-4 md:p-6">
        {/* MAIN COUNTDOWN */}
        <div className="mb-6 md:mb-8 relative">
          <SLACountdown
            deadline={deadline}
            status={status}
            variant="progress"
          />

          {/* WARNING MESSAGE */}
          {!isResolved && urgency !== "stable" && (
            <div
              className={cn(
                "mt-3 flex items-start gap-2 text-xs md:text-xs font-bold uppercase tracking-tight p-2 md:p-3 rounded-lg border",
                isCritical
                  ? "bg-error-red/10 border-error-red/20 text-error-red"
                  : "bg-warning-amber/10 border-warning-amber/20 text-warning-amber"
              )}
            >
              <ShieldAlert className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0 mt-0.5" />
              <span className="leading-tight">
                {isCritical
                  ? "SLA Breach Imminent: Escalate Now"
                  : "Approaching Deadline: Prioritize"}
              </span>
            </div>
          )}
        </div>

        {/* TEMPORAL DATA GRID */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 pt-4 md:pt-5 border-t border-border">
          <div className="space-y-1">
            <span className="text-xs md:text-xs font-black uppercase tracking-wider text-muted-foreground block">
              Started
            </span>
            <p className="text-xs md:text-sm font-mono font-bold text-foreground">
              {format(parseISO(createdAt), "MMM d, HH:mm")}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs md:text-xs font-black uppercase tracking-wider text-muted-foreground block">
              Deadline
            </span>
            <p
              className={cn(
                "text-xs md:text-sm font-mono font-bold",
                urgency === "stable"
                  ? "text-foreground"
                  : urgency === "critical"
                    ? "text-error-red"
                    : "text-warning-amber"
              )}
            >
              {deadline ? format(parseISO(deadline), "MMM d, HH:mm") : "N/A"}
            </p>
          </div>
        </div>

        {/* ACTION BUTTON */}
        {!isResolved && (
          <button
            onClick={() => {
              /* Extension Logic */
            }}
            className={cn(
              "mt-4 md:mt-6 w-full h-10 text-xs font-semibold uppercase tracking-wider border rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-95 shadow-sm",
              isCritical
                ? "text-error-red border-error-red/30 bg-error-red/5 hover:bg-error-red hover:text-white"
                : "text-primary border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <AlertCircle className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
            <span className="hidden sm:inline">Request Extension</span>
            <span className="sm:hidden">Extend</span>
          </button>
        )}
      </div>

      {/* CRITICAL OVERLAY */}
      {isCritical && (
        <div className="absolute inset-0 bg-linear-to-t from-error-red/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}