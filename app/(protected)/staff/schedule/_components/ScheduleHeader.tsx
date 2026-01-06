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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          My Schedule
        </h1>
        <p className="text-sm text-gray-500 mt-1 pl-1">
          Manage your shifts and assignments.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-gray-900 min-w-[140px] text-center select-none">
            {format(
              currentDate,
              viewMode === "month" ? "MMMM yyyy" : "MMM d, yyyy"
            )}
          </span>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="flex bg-gray-100/80 p-1 rounded-lg">
          {(["month", "day"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onViewChange(m)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md capitalize transition-all",
                viewMode === m
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
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