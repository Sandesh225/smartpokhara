"use client";

import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, format, 
  isToday 
} from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarItem {
  id: string;
  date: string;
  type: 'shift' | 'task';
  title: string;
  time?: string;
  priority?: string;
}

interface Props {
  currentDate: Date;
  viewMode: 'month' | 'week';
  items: CalendarItem[];
}

export function ScheduleCalendar({ currentDate, viewMode, items }: Props) {
  const start = startOfWeek(
    viewMode === "month" ? startOfMonth(currentDate) : currentDate
  );
  const end = endOfWeek(
    viewMode === "month" ? endOfMonth(currentDate) : currentDate
  );
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="stone-card bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "grid grid-cols-7 bg-gray-100",
          viewMode === "month" ? "auto-rows-[120px]" : "auto-rows-[400px]"
        )}
      >
        {days.map((day) => {
          const dayItems = items.filter((i) =>
            isSameDay(new Date(i.date), day)
          );
          const isCurrentMonth = isSameMonth(day, currentDate);
          const currentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "bg-white border-r border-b border-gray-100 p-2 flex flex-col gap-1.5 transition-colors hover:bg-gray-50/30",
                !isCurrentMonth && "bg-gray-50/40 text-gray-300"
              )}
            >
              <div className="flex justify-center">
                <span
                  className={cn(
                    "text-xs font-semibold h-7 w-7 flex items-center justify-center rounded-full transition-all",
                    currentDay
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-700"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                {dayItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "text-[10px] px-2 py-1.5 rounded-md truncate border-l-[3px] shadow-sm cursor-default transition-transform hover:scale-[1.02]",
                      item.type === "shift"
                        ? "bg-green-50/80 border-green-500 text-green-800"
                        : "bg-blue-50/80 border-blue-500 text-blue-800"
                    )}
                    title={item.title}
                  >
                    <div className="font-bold leading-none mb-0.5 opacity-90">
                      {item.time || "All Day"}
                    </div>
                    <div className="truncate font-medium">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}