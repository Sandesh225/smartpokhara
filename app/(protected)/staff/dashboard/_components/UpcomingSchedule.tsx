"use client";

import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Shift {
  id: string;
  date: string;
  start: string;
  end: string;
  type: string;
  location: string;
}

export function UpcomingSchedule({ shifts }: { shifts: Shift[] }) {
  if (shifts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">
          No Upcoming Shifts
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          You are free for the next few days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-blue-600" />
          Upcoming Shifts
        </h3>
        <Link
          href="/staff/schedule"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          View Calendar
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {shifts.map((shift) => {
          const shiftDate = parseISO(shift.date);
          const isToday =
            new Date().toDateString() === shiftDate.toDateString();

          return (
            <div
              key={shift.id}
              className="p-4 hover:bg-gray-50/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Date Box */}
                <div
                  className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border text-xs font-bold shadow-sm ${
                    isToday
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  <span
                    className={`text-[9px] uppercase ${
                      isToday ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {format(shiftDate, "MMM")}
                  </span>
                  <span className="text-lg leading-none mt-0.5">
                    {format(shiftDate, "dd")}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {shift.type === "night" ? "Night Shift" : "Day Shift"}
                    </p>
                    {isToday && (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] h-5 px-1.5 shadow-none"
                      >
                        Today
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5">
                    <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">
                        {shift.start} - {shift.end}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{shift.location}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <Link
        href="/staff/schedule"
        className="mt-auto border-t border-gray-50 p-3 text-center text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
      >
        See Full Schedule <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
