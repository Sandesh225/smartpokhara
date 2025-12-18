"use client";

import { useState, useEffect } from "react";
import { Timer, AlertOctagon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLACountdownProps {
  deadline: string | Date;
  status?: string;
  variant?: "badge" | "progress";
  submittedAt?: string | Date; // Optional for more accurate progress bar
}

export function SLACountdown({
  deadline,
  status,
  variant = "badge",
  submittedAt
}: SLACountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    str: string;
    urgent: boolean;
    overdue: boolean;
    percentage: number;
  } | null>(null);

  // Helper to check if resolved
  const isResolved = ["resolved", "closed", "completed"].includes(status?.toLowerCase() || "");

  useEffect(() => {
    // Stop if resolved/completed
    if (isResolved) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const due = new Date(deadline).getTime();
      const start = submittedAt ? new Date(submittedAt).getTime() : due - (72 * 60 * 60 * 1000); // Default 3 days back if unknown

      const diff = due - now;
      const totalDuration = due - start;
      const elapsed = now - start;
      
      let percentage = (elapsed / totalDuration) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      if (diff <= 0) {
        // Overdue
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        let timeStr = "";
        if (days > 0) timeStr = `${days}d overdue`;
        else timeStr = `${hours}h overdue`;

        return {
          str: timeStr,
          urgent: true,
          overdue: true,
          percentage: 100,
        };
      }

      // Remaining
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      let timeStr = "";
      if (days > 0) timeStr = `${days}d left`;
      else timeStr = `${hours}h left`;

      return {
        str: timeStr,
        urgent: hours < 24, // Urgent if less than 24h
        overdue: false,
        percentage,
      };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 60000); // Update every minute

    return () => clearInterval(timer);
  }, [deadline, status, isResolved, submittedAt]);

  // RENDER: Resolved State
  if (isResolved) {
    if (variant === "progress") {
      return (
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-green-700">Completed</span>
            <span className="text-green-600">100%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full" />
          </div>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </span>
    );
  }

  // RENDER: Loading State
  if (!timeLeft) {
    return <span className="text-xs text-gray-400 animate-pulse">Calc...</span>;
  }

  // RENDER: Progress Variant
  if (variant === "progress") {
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1.5">
          <span
            className={cn(
              "font-medium",
              timeLeft.overdue
                ? "text-red-700"
                : timeLeft.urgent
                ? "text-amber-700"
                : "text-gray-700"
            )}
          >
            {timeLeft.str}
          </span>
          <span className="text-gray-500">Deadline</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              timeLeft.overdue
                ? "bg-red-500"
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-sm border",
        timeLeft.overdue
          ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
          : timeLeft.urgent
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-blue-50 text-blue-700 border-blue-200"
      )}
      title={`Deadline: ${new Date(deadline).toLocaleString()}`}
    >
      {timeLeft.overdue ? (
        <AlertOctagon className="h-3.5 w-3.5" />
      ) : (
        <Timer className="h-3.5 w-3.5" />
      )}
      {timeLeft.str}
    </div>
  );
}