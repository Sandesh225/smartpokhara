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
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      <div className="grid grid-cols-7 border-b border-border bg-muted/50 backdrop-blur-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "grid grid-cols-7 bg-border",
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
                "bg-card border-r border-b border-border p-2 flex flex-col gap-1.5 transition-colors hover:bg-muted/30",
                !isCurrentMonth && "bg-muted/40 text-muted-foreground/30"
              )}
            >
              <div className="flex justify-center">
                <span
                  className={cn(
                    "text-xs font-black h-7 w-7 flex items-center justify-center rounded-full transition-all uppercase tracking-tighter",
                    currentDay
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                      : "text-foreground"
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
                      "text-xs px-2 py-1.5 rounded-lg truncate border border-current/10 shadow-xs cursor-default transition-all hover:scale-[1.02] font-bold uppercase tracking-tight",
                      item.type === "shift"
                        ? "bg-success-green/10 text-success-green"
                        : "bg-info-blue/10 text-info-blue"
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