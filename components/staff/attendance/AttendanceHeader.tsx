"use client";

import { Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  stats: {
    daysWorked: number;
    totalHours: number;
  };
  todayStatus: string;
}

export function AttendanceHeader({ stats, todayStatus }: Props) {
  const avgHours = stats.daysWorked > 0 ? (stats.totalHours / stats.daysWorked).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
          todayStatus === 'on_duty' ? "bg-green-50 text-green-700 border-green-200" : 
          todayStatus === 'off_duty' ? "bg-gray-100 text-gray-600 border-gray-200" :
          "bg-blue-50 text-blue-700 border-blue-200"
        }`}>
          {todayStatus === 'on_duty' ? "Currently On Duty" : 
           todayStatus === 'off_duty' ? "Shift Completed" : "Not Checked In"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <CalendarDays className="h-5 w-5 text-blue-500 mb-1" />
          <span className="text-xl font-bold text-gray-900">{stats.daysWorked}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Days This Month</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Clock className="h-5 w-5 text-purple-500 mb-1" />
          <span className="text-xl font-bold text-gray-900">{Math.round(stats.totalHours)}h</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Total Hours</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
          <span className="text-xl font-bold text-gray-900">{avgHours}h</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Avg / Day</span>
        </div>
      </div>
    </div>
  );
}