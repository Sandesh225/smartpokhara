"use client";

import { format } from "date-fns";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function AttendanceHistoryList({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="stone-card bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 flex flex-col items-center justify-center h-[340px]">
        <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <Clock className="h-6 w-6 text-gray-300" />
        </div>
        <p>No recent attendance records found.</p>
      </div>
    );
  }

  return (
    <div className="stone-card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[340px] flex flex-col">
      <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0">
        <h3 className="text-sm font-bold text-gray-900">Recent History</h3>
        <span className="text-xs text-gray-500 font-medium">Last 10 Days</span>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide">
        <div className="divide-y divide-gray-100">
          {logs.map((log) => {
            const date = new Date(log.created_at); // Use created_at for precision
            const checkIn = log.check_in_time
              ? new Date(log.check_in_time)
              : null;
            const checkOut = log.check_out_time
              ? new Date(log.check_out_time)
              : null;

            return (
              <div
                key={log.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                      log.status === "present"
                        ? "bg-green-50 text-green-600 group-hover:bg-green-100"
                        : "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                    }`}
                  >
                    {log.status === "present" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {format(date, "EEE, MMM d")}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {checkIn ? format(checkIn, "HH:mm") : "--"}
                      <span className="mx-1 text-gray-300">|</span>
                      {checkOut ? (
                        format(checkOut, "HH:mm")
                      ) : (
                        <span className="text-green-600 font-bold">Active</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-gray-900 tabular-nums">
                    {log.total_hours_worked
                      ? `${log.total_hours_worked}h`
                      : "--"}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    Duration
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
