import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Auth
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/role-helpers";

// Queries
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
import { staffPerformanceQueries } from "@/lib/supabase/queries/staff-performance";
import { staffScheduleQueries } from "@/lib/supabase/queries/staff-schedule";
import { staffAttendanceQueries } from "@/lib/supabase/queries/staff-attendance"; // Using Attendance Query for robust status

// Components
import { DashboardHeader } from "./_components/DashboardHeader";
import { TodaySummary } from "./_components/TodaySummary";
import { QuickActions } from "./_components/QuickActions";
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
  ] = await Promise.all([
    staffQueueQueries.getMyAssignments(supabase, userId),
    staffPerformanceQueries.getMyPerformance(supabase, userId),
    staffPerformanceQueries.getCompletionStats(supabase, userId),
    staffScheduleQueries.getUpcomingShifts(supabase, userId), // This was the missing function
    staffAttendanceQueries.getTodayStatus(supabase, userId),
  ]);

  const dashboardStats = {
    ...performance,
    completed_today: completionStats?.completed_today || 0,
  };

  // Determine Attendance Status
  let attendanceStatus: "not_checked_in" | "on_duty" | "off_duty" =
    "not_checked_in";
  let checkInTime = null;
  let checkOutTime = null;
  let location = null;

  if (todayAttendanceLog) {
    checkInTime = todayAttendanceLog.check_in_time;
    checkOutTime = todayAttendanceLog.check_out_time;

    if (todayAttendanceLog.check_in_location) location = "GPS Logged";

    if (!todayAttendanceLog.check_out_time) {
      attendanceStatus = "on_duty";
    } else {
      attendanceStatus = "off_duty";
    }
  }

  // Header status
  const headerStatus = {
    isCheckedIn: attendanceStatus === "on_duty",
    checkInTime: checkInTime || undefined,
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-12">
      {/* 1. Header */}
      <DashboardHeader user={user} status={headerStatus} />

      {/* 2. Stats */}
      <TodaySummary stats={dashboardStats} />

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Left: Tasks */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          <MyTasksToday tasks={assignments} />
        </div>

        {/* Right: Operations */}
        <div className="space-y-6">
          {/* Attendance Card */}
          <TodayAttendanceCard
            status={attendanceStatus}
            checkInTime={checkInTime}
            checkOutTime={checkOutTime}
            location={location}
          />

          {/* Quick Actions */}
          <div className="bg-linear-to-br from-white to-blue-50/30 p-5 rounded-2xl border border-blue-100/50 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Quick Actions
            </h3>
            <QuickActions />
          </div>

          {/* Schedule Widget */}
          <UpcomingSchedule shifts={upcomingShifts} />

          {/* Alerts */}
          <div className="min-h-[200px]">
            <RealTimeAlerts userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}