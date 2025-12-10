import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorAnalyticsQueries } from "@/lib/supabase/queries/supervisor-analytics";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { DashboardMetrics } from "@/components/supervisor/dashboard/DashboardMetrics";
import { RealTimeAlerts } from "@/components/supervisor/dashboard/RealTimeAlerts";
import { ComplaintsOverview } from "@/components/supervisor/dashboard/ComplaintsOverview";
import { ActivityFeed } from "@/components/supervisor/dashboard/ActivityFeed";
import { TeamOverview } from "@/components/supervisor/dashboard/TeamOverview";
import { QuickActions } from "@/components/supervisor/dashboard/QuickActions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SupervisorDashboard() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  // Create Server Client (Has Cookies/Auth)
  const supabase = await createClient();

  // Pass 'supabase' client to ALL queries
  const [
    metrics,
    statusData,
    categoryData,
    trendData,
    activityData,
    staffData,
  ] = await Promise.all([
    supervisorAnalyticsQueries.getComplaintMetrics(supabase, user.id),
    supervisorAnalyticsQueries.getStatusDistribution(supabase),
    supervisorAnalyticsQueries.getCategoryBreakdown(supabase),
    supervisorAnalyticsQueries.getTrendData(supabase, user.id),
    supervisorAnalyticsQueries.getRecentActivity(supabase),
    supervisorStaffQueries.getSupervisedStaff(supabase, user.id),
  ]);

  // Construct initial alerts based on metrics
  const initialAlerts: any[] = [];

  if (metrics.overdueCount > 0) {
    initialAlerts.push({
      id: "overdue-alert",
      type: "overdue" as const,
      message: `${metrics.overdueCount} complaints have breached SLA deadlines`,
      timestamp: new Date().toISOString(),
      link: "/supervisor/complaints/overdue",
    });
  }

  if (metrics.unassignedCount > 0) {
    initialAlerts.push({
      id: "unassigned-alert",
      type: "unassigned" as const,
      message: `${metrics.unassignedCount} complaints waiting for assignment`,
      timestamp: new Date().toISOString(),
      link: "/supervisor/complaints/unassigned",
    });
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Monitor complaints, team performance, and key metrics at a glance.
        </p>
      </div>

      {/* Header Metrics */}
      <DashboardMetrics metrics={metrics} />

      {/* Quick Actions */}
      <QuickActions
        counts={{
          unassigned: metrics.unassignedCount,
          overdue: metrics.overdueCount,
        }}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <ComplaintsOverview
            statusData={statusData}
            categoryData={categoryData}
            trendData={trendData}
          />

          <TeamOverview staff={staffData} />
        </div>

        {/* Sidebar - Alerts & Activity */}
        <div className="space-y-6">
          <div className="min-h-[350px]">
            <RealTimeAlerts initialAlerts={initialAlerts} />
          </div>

          <div className="min-h-[400px]">
            <ActivityFeed initialActivity={activityData} />
          </div>
        </div>
      </div>
    </div>
  );
}
