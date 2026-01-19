"use client";

import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { format, parseISO, differenceInHours } from "date-fns";
import { AlertCircle, Timer, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SLATrackerProps {
  deadline: string;
  status: string;
  createdAt: string;
}

export function SLATracker({ deadline, status, createdAt }: SLATrackerProps) {
  const isResolved = ["resolved", "closed"].includes(status.toLowerCase());

  // Memoized Urgency Calculation
  const urgency = useMemo(() => {
    if (isResolved) return "complete";
    const hoursLeft = differenceInHours(parseISO(deadline), new Date());
    if (hoursLeft <= 12) return "critical"; // Red/Pulse
    if (hoursLeft <= 48) return "warning"; // Marigold/High-contrast
    return "stable"; // Primary/Dimmed
  }, [deadline, isResolved]);

  const isCritical = urgency === "critical";

  return (
    <div
      className={cn(
        "stone-card-elevated dark:glass-glow overflow-hidden transition-all duration-500 border-none relative group",
        isCritical &&
          "ring-1 ring-highlight-tech/30 shadow-[0_0_25px_-5px_rgba(255,184,0,0.2)]"
      )}
    >
      {/* ⚡ Status Badge with Dynamic Colors */}
      <div
        className={cn(
          "absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-xl shadow-sm z-10 transition-colors",
          urgency === "complete" && "bg-emerald-500 text-white",
          urgency === "critical" && "bg-red-600 text-white animate-pulse",
          urgency === "warning" && "bg-highlight-tech text-dark-midnight",
          urgency === "stable" && "bg-primary text-primary-foreground"
        )}
      >
        {isResolved
          ? "Protocol Complete"
          : isCritical
            ? "Immediate Breach"
            : "Active Monitor"}
      </div>

      {/* Header with Glass Effect */}
      <div className="px-5 py-4 border-b border-primary/10 bg-primary/5 dark:bg-dark-surface/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer
            className={cn(
              "h-3.5 w-3.5",
              isCritical ? "text-highlight-tech" : "text-primary"
            )}
          />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-glow">
            Temporal Parameters
          </h3>
        </div>
        {isCritical && (
          <Zap className="h-3 w-3 text-highlight-tech animate-bounce" />
        )}
      </div>

      <div className="p-6">
        {/* Main Countdown Visualizer */}
        <div className="mb-8 relative">
          <SLACountdown
            deadline={deadline}
            status={status}
            variant="progress"
          />

          {/* Enhanced Critical Warning */}
          {!isResolved && urgency !== "stable" && (
            <div
              className={cn(
                "mt-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-tight p-2 rounded-lg border",
                isCritical
                  ? "bg-red-500/10 border-red-500/20 text-red-500"
                  : "bg-highlight-tech/10 border-highlight-tech/20 text-highlight-tech"
              )}
            >
              <ShieldAlert className="h-3 w-3" />
              <span>
                {isCritical
                  ? "SLA Breach Imminent: Escalation Protocol Active"
                  : "Approaching Deadline: Prioritize Deployment"}
              </span>
            </div>
          )}
        </div>

        {/* Temporal Data Grid */}
        <div className="grid grid-cols-2 gap-6 pt-5 border-t border-primary/5">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Inception
            </span>
            <p className="text-[11px] font-mono font-bold text-foreground/80">
              {format(parseISO(createdAt), "MMM d, HH:mm")}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
              Termination
            </span>
            <p
              className={cn(
                "text-[11px] font-mono font-bold",
                urgency === "stable"
                  ? "text-foreground/80"
                  : "text-highlight-tech"
              )}
            >
              {format(parseISO(deadline), "MMM d, HH:mm")}
            </p>
          </div>
        </div>

        {/* Action Button: Enhanced Interactivity */}
        {!isResolved && (
          <button
            onClick={() => {
              /* Trigger Extension Logic */
            }}
            className="mt-6 w-full py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-highlight-tech border border-highlight-tech/30 bg-highlight-tech/5 hover:bg-highlight-tech hover:text-dark-midnight rounded-xl transition-all duration-500 flex items-center justify-center gap-2 group/btn active:scale-95"
          >
            <AlertCircle className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-12" />
            Request Protocol Extension
          </button>
        )}
      </div>

      {/* 🏔️ Machhapuchhre Visual Accent */}
      {isCritical && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}