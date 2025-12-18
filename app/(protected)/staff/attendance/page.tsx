import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { staffAttendanceQueries } from "@/lib/supabase/queries/staff-attendance";
import { AttendanceHeader } from "@/components/staff/attendance/AttendanceHeader";
import { CheckInOutPanel } from "@/components/staff/attendance/CheckInOutPanel";
import { AttendanceHistoryList } from "@/components/staff/attendance/AttendanceHistoryList";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Parallel Fetch
  const [todayStatus, history, stats] = await Promise.all([
    staffAttendanceQueries.getTodayStatus(supabase, user.id),
    staffAttendanceQueries.getAttendanceHistory(supabase, user.id),
    staffAttendanceQueries.getAttendanceStats(supabase, user.id)
  ]);

  // Determine current status
  let currentStatus: 'not_checked_in' | 'on_duty' | 'off_duty' = 'not_checked_in';
  if (todayStatus?.check_in_time) {
    currentStatus = todayStatus.check_out_time ? 'off_duty' : 'on_duty';
  }

  return (
    <div className="space-y-6 pb-20">
      <AttendanceHeader stats={stats} todayStatus={currentStatus} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CheckInOutPanel 
            initialStatus={currentStatus}
            checkInTime={todayStatus?.check_in_time}
            checkOutTime={todayStatus?.check_out_time}
          />
        </div>
        
        <div className="lg:col-span-2">
          <AttendanceHistoryList logs={history} />
        </div>
      </div>
    </div>
  );
}