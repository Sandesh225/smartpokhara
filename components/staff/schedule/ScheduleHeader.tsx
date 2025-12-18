"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from "lucide-react";
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

export function ScheduleHeader({ currentDate, viewMode, onViewChange, onDateChange, todayShift }: Props) {
  
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            My Schedule
          </h1>
          {todayShift && (
            <p className="text-sm text-gray-500 mt-1">Today: {todayShift}</p>
          )}
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['month', 'week', 'day'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onViewChange(m)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all",
                viewMode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-base font-bold text-gray-900 min-w-[140px] text-center">
            {format(currentDate, viewMode === 'month' ? "MMMM yyyy" : "MMM d, yyyy")}
          </span>
          <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <button 
          onClick={() => onDateChange(new Date())}
          className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
}