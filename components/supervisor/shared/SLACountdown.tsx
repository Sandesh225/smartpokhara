"use client";

import { useState, useEffect } from "react";
import { Timer, AlertOctagon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLACountdownProps {
  deadline?: string | Date | null;
  createdAt?: string | Date | null;
  status?: string;
  variant?: "badge" | "progress";
}

export function SLACountdown({
  deadline,
  createdAt,
  status,
  variant = "badge",
}: SLACountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    str: string;
    urgent: boolean;
    overdue: boolean;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    // If resolved, show static success state
    if (["resolved", "closed", "completed"].includes(status?.toLowerCase() || "")) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      if (!deadline) return null;
      const now = new Date().getTime();
      const due = new Date(deadline).getTime();
      const start = createdAt ? new Date(createdAt).getTime() : due - (72 * 60 * 60 * 1000); 
      
      const diff = due - now;
      const totalDuration = due - start;
      const elapsed = now - start;

      // Calculate percentage consumed
      let percentage = (elapsed / totalDuration) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      if (diff <= 0) {
        // Overdue logic
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        let timeStr = "";
        if (days > 0) timeStr = `${days}d ${hours % 24}h overdue`;
        else timeStr = `${hours}h overdue`;

        return {
          str: timeStr,
          urgent: true,
          overdue: true,
          percentage: 100, // Bar full red
        };
      }

      // Remaining logic
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const days = Math.floor(hours / 24);

      let timeStr = "";
      if (days > 0) timeStr = `${days}d ${hours % 24}h left`;
      else timeStr = `${hours}h ${minutes}m left`;

      return {
        str: timeStr,
        urgent: hours < 24, // Urgent if less than 24h
        overdue: false,
        percentage,
      };
    };

    // Initial calculation
    setTimeLeft(calculateTime());
    
    // Update every minute
    const timer = setInterval(() => setTimeLeft(calculateTime()), 60000);

    return () => clearInterval(timer);
  }, [deadline, createdAt, status]);

  // RENDER: Completed State
  if (["resolved", "closed", "completed"].includes(status?.toLowerCase() || "")) {
    if (variant === "progress") {
      return (
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-accent-nature">Completed</span>
            <span className="text-accent-nature/80 font-mono">100%</span>
          </div>
          <div className="h-1.5 w-full bg-accent-nature/10 rounded-full overflow-hidden border border-accent-nature/10">
            <div className="h-full bg-accent-nature w-full transition-all duration-700 ease-out" />
          </div>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black text-accent-nature bg-accent-nature/10 px-2 py-0.5 rounded-full border border-accent-nature/20 uppercase tracking-widest shadow-sm">
        <CheckCircle2 className="h-3 w-3" />
        SLA Met
      </span>
    );
  }

  // RENDER: Missing Deadline
  if (!deadline) {
    if (variant === "progress") {
      return (
        <div className="w-full">
          <div className="flex items-center mb-1.5">
            <span className="text-xs font-bold font-mono text-muted-foreground">Deadline N/A</span>
          </div>
          <div className="h-1.5 w-full bg-muted dark:bg-muted/50 rounded-full overflow-hidden">
             <div className="h-full w-full bg-muted-foreground/20 rounded-full" />
          </div>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border bg-muted/10 text-muted-foreground border-border">
        <Timer className="h-3 w-3" />
        No Deadline
      </span>
    );
  }

  // RENDER: Loading State
  if (!timeLeft)
    return <span className="text-xs font-mono text-muted-foreground animate-pulse">Calculating...</span>;

  // RENDER: Progress Bar Variant
  if (variant === "progress") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-end mb-1.5">
          <span
            className={cn(
              "text-xs font-bold font-mono",
              timeLeft.overdue
                ? "text-destructive"
                : timeLeft.urgent
                ? "text-secondary-foreground"
                : "text-foreground"
            )}
          >
            {timeLeft.str}
          </span>
          <span className="text-xs text-muted-foreground font-black uppercase tracking-wider">Remaining</span>
        </div>
        <div className="h-1.5 w-full bg-muted dark:bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              timeLeft.overdue
                ? "bg-destructive animate-pulse"
                : timeLeft.urgent
                ? "bg-secondary"
                : "bg-primary"
            )}
            style={{ width: `${timeLeft.percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // RENDER: Badge Variant (Default)
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
        timeLeft.overdue
          ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse"
          : timeLeft.urgent
          ? "bg-secondary/10 text-secondary-foreground border-secondary/30"
          : "bg-primary/10 text-primary border-primary/20"
      )}
      title={deadline ? `Deadline: ${new Date(deadline).toLocaleString()}` : "No Deadline"}
    >
      {timeLeft.overdue ? (
        <AlertOctagon className="h-3 w-3" />
      ) : (
        <Timer className="h-3 w-3" />
      )}
      {timeLeft.str}
    </div>
  );
}