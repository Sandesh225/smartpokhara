"use client";

import { Clock, CalendarDays, BarChart3 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  stats: {
    daysWorked: number;
    totalHours: number;
  };
  todayStatus: "not_checked_in" | "on_duty" | "off_duty";
}

export function AttendanceHeader({ stats, todayStatus }: Props) {
  const avgHours =
    stats.daysWorked > 0
      ? (stats.totalHours / stats.daysWorked).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Attendance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm transition-colors duration-300 ${
            todayStatus === "on_duty"
              ? "bg-green-50 text-green-700 border-green-200"
              : todayStatus === "off_duty"
              ? "bg-gray-50 text-gray-600 border-gray-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {todayStatus === "on_duty"
            ? "● Currently On Duty"
            : todayStatus === "off_duty"
            ? "✓ Shift Completed"
            : "○ Not Checked In"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Stat Card 1 */}
        <div className="stone-card p-4 flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            {stats.daysWorked}
          </span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
            Days (Month)
          </span>
        </div>

        {/* Stat Card 2 */}
        <div className="stone-card p-4 flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            {Math.round(stats.totalHours)}h
          </span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
            Total Hours
          </span>
        </div>

        {/* Stat Card 3 */}
        <div className="stone-card p-4 flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            {avgHours}h
          </span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
            Avg / Day
          </span>
        </div>
      </div>
    </div>
  );
}