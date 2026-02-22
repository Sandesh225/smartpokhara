"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff";
import {
  ScheduleHeader,
  ViewMode,
} from "@/app/(protected)/staff/schedule/_components/ScheduleHeader";
import { ScheduleCalendar } from "@/app/(protected)/staff/schedule/_components/ScheduleCalendar";
import { DayScheduleView } from "@/app/(protected)/staff/schedule/_components/DayScheduleView";
import { UpcomingTasksList } from "@/app/(protected)/staff/schedule/_components/UpcomingTasksList";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data State
  const [data, setData] = useState<{ shifts: any[]; tasks: any[] }>({
    shifts: [],
    tasks: [],
  });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate fetch range based on current view date
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();

      try {
        const [scheduleData, upcomingData] = await Promise.all([
          // Calling the newly added function
          staffApi.getFullSchedule(supabase, user.id, start, end),
          staffApi.getUpcomingTasks(supabase, user.id),
        ]);

        setData(scheduleData);
        setUpcoming(upcomingData);
      } catch (err) {
        console.error("Schedule Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentDate]);

  // Combine items for calendar display
  const calendarItems = [...data.shifts, ...data.tasks];

  // Filter items specifically for the Day View
  const dayItems = calendarItems
    .filter((i) => i.date === format(currentDate, "yyyy-MM-dd"))
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header Section */}
      <ScheduleHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onDateChange={setCurrentDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Calendar Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-96 w-full flex flex-col items-center justify-center bg-card rounded-2xl border border-border border-dashed">
              <LoadingSpinner className="w-8 h-8 text-primary mb-4" />
              <p className="text-muted-foreground/40 text-xs font-bold uppercase tracking-widest animate-pulse italic">
                Syncing schedule...
              </p>
            </div>
          ) : viewMode === "day" ? (
            <DayScheduleView date={currentDate} items={dayItems} />
          ) : (
            <ScheduleCalendar
              currentDate={currentDate}
              viewMode={viewMode as "month" | "week"}
              items={calendarItems}
            />
          )}
        </div>

        {/* Right Sidebar: Upcoming Tasks */}
        <div className="space-y-6">
          <div className="bg-info-blue/10 rounded-2xl p-6 text-info-blue border border-info-blue/20 shadow-xs relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-info-blue/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
            <h3 className="font-black text-xs uppercase tracking-widest mb-2 relative z-10">Quick Note</h3>
            <p className="text-sm font-bold leading-relaxed relative z-10 opacity-90">
              Shift timings are subject to change by ward supervisors. Check
              daily for updates.
            </p>
          </div>

          <UpcomingTasksList tasks={upcoming} />
        </div>
      </div>
    </div>
  );
}