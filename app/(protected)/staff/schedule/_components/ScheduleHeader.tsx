"use client";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type ViewMode = "month" | "week" | "day";

interface Props {
  currentDate: Date;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onDateChange: (date: Date) => void;
  todayShift?: string;
}

export function ScheduleHeader({
  currentDate,
  viewMode,
  onViewChange,
  onDateChange,
}: Props) {
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
          <div className="p-2.5 bg-info-blue/10 text-info-blue rounded-xl border border-info-blue/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          My Schedule
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 pl-0.5">
          Manage your shifts and assignments.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-card p-1.5 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-foreground min-w-[120px] text-center select-none uppercase tracking-wider">
            {format(
              currentDate,
              viewMode === "month" ? "MMMM yyyy" : "MMM d, yyyy"
            )}
          </span>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
          {(["month", "day"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onViewChange(m)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md capitalize transition-all",
                viewMode === m
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}