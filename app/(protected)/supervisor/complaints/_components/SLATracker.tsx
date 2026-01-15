"use client";

import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { format } from "date-fns";
import { AlertCircle, Timer, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLATrackerProps {
  deadline: string;
  status: string;
  createdAt: string;
}

/**
 * 🏔️ MACHHAPUCHHRE MODERN: SLA TRACKER
 * Focuses on 'Temporal Urgency' using high-contrast tracking and 
 * the 'highlight-tech' (Marigold) color palette.
 */
export function SLATracker({ deadline, status, createdAt }: SLATrackerProps) {
  const isResolved = ["resolved", "closed"].includes(status.toLowerCase());
  
  // Logic to determine if we are in a 'Critical' time state
  const isCritical = new Date(deadline).getTime() - Date.now() < 3600000 * 24; // Less than 24h

  return (
    <div className="stone-card-elevated dark:glass-glow overflow-hidden transition-colors-smooth border-none relative group">
      {/* ⚡ High-Tech Status Indicator */}
      <div className={cn(
        "absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-xl shadow-sm z-10",
        isResolved 
          ? "bg-emerald-500 text-white" 
          : "bg-highlight-tech text-dark-midnight animate-pulse"
      )}>
        {isResolved ? "Protocol Complete" : "Active Monitor"}
      </div>

      <div className="px-5 py-4 border-b border-primary/10 bg-primary/5 dark:bg-dark-surface/40 flex items-center gap-2">
        <Timer className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-glow">
          Temporal Parameters
        </h3>
      </div>

      <div className="p-6">
        {/* Main Countdown Visualizer */}
        <div className="mb-8 relative">
          <SLACountdown 
            deadline={deadline} 
            status={status} 
            variant="progress" 
          />
          {isCritical && !isResolved && (
            <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-highlight-tech uppercase tracking-tighter">
              <ShieldAlert className="h-3 w-3" />
              Breach Risk: Immediate Action Required
            </div>
          )}
        </div>

        {/* Temporal Data Grid */}
        <div className="grid grid-cols-2 gap-6 pt-5 border-t border-primary/5">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
              Inception
            </span>
            <p className="text-[11px] font-mono font-bold text-foreground">
              {format(new Date(createdAt), "MMM d, HH:mm")}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
              Termination
            </span>
            <p className={cn(
              "text-[11px] font-mono font-bold",
              isCritical ? "text-highlight-tech" : "text-foreground"
            )}>
              {format(new Date(deadline), "MMM d, HH:mm")}
            </p>
          </div>
        </div>

        {/* Operational Actions */}
        {!isResolved && (
          <button className="mt-6 w-full py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-highlight-tech border border-highlight-tech/30 bg-highlight-tech/5 hover:bg-highlight-tech hover:text-dark-midnight rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn">
            <AlertCircle className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-12" />
            Request Protocol Extension
          </button>
        )}
      </div>

      {/* Decorative Technical Detail */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
    </div>
  );
}