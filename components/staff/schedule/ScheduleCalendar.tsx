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
  // Calendar Generation Logic
  const start = startOfWeek(viewMode === 'month' ? startOfMonth(currentDate) : currentDate);
  const end = endOfWeek(viewMode === 'month' ? endOfMonth(currentDate) : currentDate);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={cn("grid grid-cols-7", viewMode === 'month' ? "auto-rows-[100px]" : "auto-rows-[400px]")}>
        {days.map(day => {
          const dayItems = items.filter(i => isSameDay(new Date(i.date), day));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const currentDay = isToday(day);

          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "border-r border-b border-gray-100 p-1 flex flex-col gap-1 transition-colors hover:bg-gray-50/50",
                !isCurrentMonth && viewMode === 'month' && "bg-gray-50/30 text-gray-300"
              )}
            >
              <div className="text-center p-1">
                 <span className={cn(
                   "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full mx-auto",
                   currentDay ? "bg-blue-600 text-white" : "text-gray-700"
                 )}>
                   {format(day, 'd')}
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "text-[10px] px-1.5 py-1 rounded truncate border-l-2",
                      item.type === 'shift' 
                        ? "bg-green-50 border-green-500 text-green-700" 
                        : "bg-blue-50 border-blue-500 text-blue-700"
                    )}
                  >
                    <div className="font-semibold leading-none mb-0.5">
                      {item.time || "All Day"}
                    </div>
                    <div className="truncate">{item.title}</div>
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