import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { staffApi } from "@/features/staff";
import { CheckInOutPanel } from "./_components/CheckInOutPanel";
import { AttendanceHistoryList } from "./_components/AttendanceHistoryList";
import { AttendanceHeader } from "./_components/AttendanceHeader";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  // 1. Auth Guard
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  // 2. Initialize Supabase
  const supabase = await createClient();

  // 3. Parallel Data Fetching
  const [todayStatus, history, stats] = await Promise.all([
    staffApi.getTodayStatus(supabase, user.id),
    staffApi.getAttendanceHistory(supabase, user.id),
    staffApi.getAttendanceStats(supabase, user.id),
  ]);

  // 4. Logic: Determine Current Status
  // Default: Not Checked In
  let currentStatus: "not_checked_in" | "on_duty" | "off_duty" =
    "not_checked_in";

  if (todayStatus) {
    if (!todayStatus.check_out_time) {
      // Record exists and no checkout time => ON DUTY
      currentStatus = "on_duty";
    } else {
      // Record exists and has checkout time => OFF DUTY (Completed)
      currentStatus = "off_duty";
    }
  }

  // 5. Render
  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Stats */}
      <AttendanceHeader stats={stats} todayStatus={currentStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Action Panel */}
        <div className="lg:col-span-1">
          {/* Key ensures the component resets completely if the server state changes */}
          <CheckInOutPanel
            key={currentStatus}
            initialStatus={currentStatus}
            checkInTime={todayStatus?.check_in_time}
            checkOutTime={todayStatus?.check_out_time}
          />
        </div>

        {/* Right Column: History List */}
        <div className="lg:col-span-2">
          <AttendanceHistoryList logs={history} />
        </div>
      </div>
    </div>
  );
}