import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Auth
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/role-helpers";

// API
import { staffApi } from "@/features/staff/api";

// Components
import { DashboardHeader } from "./_components/DashboardHeader";
import { TodaySummary } from "./_components/TodaySummary";

import { MyTasksToday } from "./_components/MyTasksToday";
import { RealTimeAlerts } from "./_components/RealTimeAlerts";
import { UpcomingSchedule } from "./_components/UpcomingSchedule";
import { TodayAttendanceCard } from "../attendance/_components/TodayAttendanceCard";

export const dynamic = "force-dynamic";

export default async function StaffDashboard() {
  const user = await getCurrentUserWithRoles();

  if (!user) redirect("/login");
  if (!isStaff(user)) redirect("/");

  const supabase = await createClient();
  const userId = user.id;

  // Parallel Fetch
  const [
    assignments,
    performance,
    completionStats,
    upcomingShifts,
    todayAttendanceLog,
    assignmentCounts,
  ] = await Promise.all([
    staffApi.getStaffAssignments(supabase, userId),
    staffApi.getMyPerformance(supabase, userId),
    staffApi.getCompletionStats(supabase, userId),
    staffApi.getUpcomingShifts(supabase, userId),
    staffApi.getTodayStatus(supabase, userId),
    staffApi.getAssignmentCounts(supabase, userId),
  ]);

  const dashboardStats = {
    ...performance,
    completed_today: completionStats?.completed_today || 0,
    totalAssigned: assignmentCounts.totalAssigned,
    totalDone: assignmentCounts.totalDone,
  };

  // Determine Attendance Status
  let attendanceStatus: "not_checked_in" | "on_duty" | "off_duty" =
    "not_checked_in";
  let checkInTime = null;
  let checkOutTime = null;
  let location: string | null = null; // Fix type

  if (todayAttendanceLog) {
    if (todayAttendanceLog.on_duty) {
        attendanceStatus = "on_duty";
    } else if (todayAttendanceLog.check_out_time) {
        attendanceStatus = "off_duty";
    }

    checkInTime = todayAttendanceLog.check_in_time;
    checkOutTime = todayAttendanceLog.check_out_time;

    // Handle check_in_location if it's a JSON object or string
    // In api.ts it returns `check_in_location` from DB which might be GeoJSON or null.
    // The previous code had `if (todayAttendanceLog.check_in_location) location = "GPS Logged";`
    if (todayAttendanceLog.check_in_location) {
        location = "GPS Logged";
    }
  }
  
  // Header status
  const headerStatus = {
    isCheckedIn: attendanceStatus === "on_duty",
    checkInTime: checkInTime || undefined,
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-12 px-4 sm:px-6 lg:px-8">
      {/* 1. Header */}
      <DashboardHeader user={user} status={headerStatus} />

      {/* 2. Stats */}
      <section aria-label="Today's performance summary" className="perf-card">
        <TodaySummary stats={dashboardStats} />
      </section>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Left: Tasks */}
        <section aria-label="Today's task queue" className="lg:col-span-2 xl:col-span-3 space-y-6">
          <MyTasksToday tasks={assignments} />
        </section>

        {/* Right: Operations */}
        <aside aria-label="Operations sidebar" className="space-y-6">
          {/* Attendance Card */}
          <section aria-label="Attendance status" className="perf-offscreen">
            <TodayAttendanceCard
              status={attendanceStatus}
              checkInTime={checkInTime}
              checkOutTime={checkOutTime}
              location={location}
            />
          </section>

          {/* Schedule Widget */}
          <section aria-label="Upcoming schedule" className="perf-offscreen">
            <UpcomingSchedule shifts={upcomingShifts} />
          </section>

          {/* Alerts */}
          <section aria-label="Real-time alerts" className="min-h-[200px] perf-offscreen">
             <RealTimeAlerts userId={userId} />
          </section>
        </aside>
      </div>
    </div>
  );
}