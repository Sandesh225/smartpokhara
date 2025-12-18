"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { staffScheduleQueries } from "@/lib/supabase/queries/staff-schedule";
import { ScheduleHeader, ViewMode } from "@/components/staff/schedule/ScheduleHeader";
import { ScheduleCalendar } from "@/components/staff/schedule/ScheduleCalendar";
import { DayScheduleView } from "@/components/staff/schedule/DayScheduleView";
import { UpcomingTasksList } from "@/components/staff/schedule/UpcomingTasksList";
import { LoadingSpinner } from "@/components/staff/shared/LoadingSpinner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<{ shifts: any[], tasks: any[] }>({ shifts: [], tasks: [] });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch range based on view (simplified to always fetch month for cache)
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();

      try {
        const [res, upcomingTasks] = await Promise.all([
           staffScheduleQueries.getFullSchedule(supabase, user.id, start, end),
           staffScheduleQueries.getUpcomingTasks(supabase, user.id)
        ]);
        
        setData(res);
        setUpcoming(upcomingTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentDate]);

  // Combine items for calendar
  const calendarItems = [
    ...data.shifts,
    ...data.tasks
  ];

  // Filter for day view
  const dayItems = calendarItems.filter(i => 
    i.date === format(currentDate, 'yyyy-MM-dd')
  ).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="space-y-6 pb-20">
      <ScheduleHeader 
        currentDate={currentDate}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onDateChange={setCurrentDate}
        todayShift="09:00 - 17:00" // Placeholder
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
             {loading ? (
               <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
             ) : (
               viewMode === 'day' ? (
                 <DayScheduleView date={currentDate} items={dayItems} />
               ) : (
                 <ScheduleCalendar 
                   currentDate={currentDate}
                   viewMode={viewMode as 'month' | 'week'}
                   items={calendarItems}
                 />
               )
             )}
          </div>
          
          <div className="space-y-6">
             <UpcomingTasksList tasks={upcoming} />
          </div>
       </div>
    </div>
  );
}