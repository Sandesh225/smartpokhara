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
      <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted dark:bg-muted/50 flex items-center justify-center mb-3">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No Upcoming Shifts</h3>
        <p className="text-xs text-muted-foreground mt-1">
          You are free for the next few days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
      <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30 dark:bg-muted/10">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-sm uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-primary" />
          Upcoming Shifts
        </h3>
        <Link
          href="/staff/schedule"
          className="text-xs font-medium text-primary hover:text-primary/80 dark:hover:text-primary/90 hover:underline transition-colors"
        >
          View Calendar
        </Link>
      </div>

      <div className="divide-y divide-border">
        {shifts.map((shift) => {
          const shiftDate = parseISO(shift.date);
          const isToday = new Date().toDateString() === shiftDate.toDateString();

          return (
            <div
              key={shift.id}
              className="p-4 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Date Box */}
                <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border text-xs font-bold shadow-sm transition-all ${
                  isToday
                    ? "bg-primary border-primary text-primary-foreground dark:bg-primary dark:border-primary/80"
                    : "bg-card border-border text-foreground dark:bg-muted/50"
                }`}>
                  <span className={`text-[9px] uppercase ${
                    isToday ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {format(shiftDate, "MMM")}
                  </span>
                  <span className="text-lg leading-none mt-0.5">
                    {format(shiftDate, "dd")}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-foreground truncate">
                      {shift.type === "night" ? "Night Shift" : "Day Shift"}
                    </p>
                    {isToday && (
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/10 text-primary text-[10px] h-5 px-1.5 shadow-none dark:border-primary/30 dark:bg-primary/20"
                      >
                        Today
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
                    <div className="flex items-center gap-1.5 bg-muted dark:bg-muted/50 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium text-foreground">
                        {shift.start} - {shift.end}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3" />
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
        className="mt-auto border-t border-border p-3 text-center text-xs font-medium text-muted-foreground hover:text-primary dark:hover:text-primary/90 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors flex items-center justify-center gap-1"
      >
        See Full Schedule <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}