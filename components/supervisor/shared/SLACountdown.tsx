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
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Completed</span>
            <span className="text-emerald-600 dark:text-emerald-500">100%</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full" />
          </div>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wide">
        <CheckCircle2 className="h-3 w-3" />
        SLA Met
      </span>
    );
  }

  // RENDER: Loading State
  if (!timeLeft)
    return <span className="text-[10px] font-mono text-muted-foreground animate-pulse">CALC_SLA...</span>;

  // RENDER: Progress Bar Variant
  if (variant === "progress") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-end mb-1.5">
          <span
            className={cn(
              "text-xs font-bold font-mono",
              timeLeft.overdue
                ? "text-red-600 dark:text-red-400"
                : timeLeft.urgent
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground"
            )}
          >
            {timeLeft.str}
          </span>
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Remaining</span>
        </div>
        <div className="h-1.5 w-full bg-muted dark:bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              timeLeft.overdue
                ? "bg-red-500 animate-pulse"
                : timeLeft.urgent
                ? "bg-amber-500"
                : "bg-blue-500"
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide transition-all shadow-sm border",
        timeLeft.overdue
          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 animate-pulse"
          : timeLeft.urgent
          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50"
          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50"
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