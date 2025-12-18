import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Auth
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/role-helpers";

// Queries
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
import { staffPerformanceQueries } from "@/lib/supabase/queries/staff-performance";

// Components
import { DashboardHeaderGreeting } from "@/components/staff/dashboard/DashboardHeaderGreeting";
import { TodaySummary } from "@/components/staff/dashboard/TodaySummary";
import { QuickActions } from "@/components/staff/dashboard/QuickActions";
import { MyTasksToday } from "@/components/staff/dashboard/MyTasksToday";
import { RealTimeAlerts } from "@/components/staff/dashboard/RealTimeAlerts";

export const dynamic = "force-dynamic";

export default async function StaffDashboard() {
  // 1. Fetch User & Roles
  const user = await getCurrentUserWithRoles();

  // 2. Security Guard
  if (!user) {
    redirect("/login");
  }

  // Strict check: User must be staff or have an active staff profile
  if (!isStaff(user)) {
    redirect("/");
  }

  // 3. Initialize Supabase
  const supabase = await createClient();
  const userId = user.id;

  // 4. Parallel Data Fetching
  const [assignments, performance, completionStats] = await Promise.all([
    staffQueueQueries.getMyAssignments(supabase, userId),
    staffPerformanceQueries.getMyPerformance(supabase, userId),
    staffPerformanceQueries.getCompletionStats(supabase, userId),
  ]);

  // 5. Aggregate Data for UI
  const dashboardStats = {
    ...performance, // e.g., efficiency, average_rating
    completed_today: completionStats?.completed_today || 0,
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="space-y-2">
        <DashboardHeaderGreeting user={user} />
        <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
          Here's your daily briefing and active assignments.
        </p>
      </div>

      {/* Stats Cards */}
      <TodaySummary stats={dashboardStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <MyTasksToday tasks={assignments} />
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-linear-to-br from-white to-gray-50/50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-blue-600" />
              Quick Actions
            </h3>
            <QuickActions />
          </div>

          {/* Real-time Alerts */}
          <div className="min-h-[300px]">
            <RealTimeAlerts userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
