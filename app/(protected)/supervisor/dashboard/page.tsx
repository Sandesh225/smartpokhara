import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorAnalyticsQueries } from "@/lib/supabase/queries/supervisor-analytics";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { DashboardMetrics } from "@/app/(protected)/supervisor/dashboard/_components/DashboardMetrics";
import { RealTimeAlerts } from "@/app/(protected)/supervisor/dashboard/_components/RealTimeAlerts";
import { ComplaintsOverview } from "@/app/(protected)/supervisor/dashboard/_components/ComplaintsOverview";
import { ActivityFeed } from "@/app/(protected)/supervisor/dashboard/_components/ActivityFeed";
import { TeamOverview } from "@/app/(protected)/supervisor/dashboard/_components/TeamOverview";
import { QuickActions } from "@/app/(protected)/supervisor/dashboard/_components/QuickActions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SupervisorDashboard() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Parallel Data Fetching
  const [
    metrics,
    statusData,
    categoryData,
    trendData,
    activityData,
    staffData,
  ] = await Promise.all([
    supervisorAnalyticsQueries.getComplaintMetrics(supabase, user.id),
    supervisorAnalyticsQueries.getStatusDistribution(supabase, user.id),
    supervisorAnalyticsQueries.getCategoryBreakdown(supabase, user.id),
    supervisorAnalyticsQueries.getTrendData(supabase, user.id),
    supervisorAnalyticsQueries.getRecentActivity(supabase, user.id),
    supervisorStaffQueries.getSupervisedStaff(supabase, user.id),
  ]);

  const initialAlerts: any[] = [];
  if (metrics.overdueCount > 0) {
    initialAlerts.push({
      id: "overdue-alert",
      type: "overdue",
      message: `${metrics.overdueCount} complaints have breached SLA deadlines`,
      timestamp: new Date().toISOString(),
      link: "/supervisor/complaints/overdue",
    });
  }

  if (metrics.unassignedCount > 0) {
    initialAlerts.push({
      id: "unassigned-alert",
      type: "unassigned",
      message: `${metrics.unassignedCount} complaints waiting for assignment`,
      timestamp: new Date().toISOString(),
      link: "/supervisor/complaints/unassigned",
    });
  }

  return (
    /* Change: Used bg-background instead of bg-slate-50 */
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-background min-h-screen transition-colors duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Monitor complaints, team performance, and key metrics for your
          jurisdiction.
        </p>
      </div>

      {/* Header Metrics Cards - Should use --card internally */}
      <DashboardMetrics metrics={metrics} />

      {/* Quick Actions Bar - Using glass or card styling */}
      <div className="stone-card p-1 shadow-sm">
        <QuickActions
          counts={{
            unassigned: metrics.unassignedCount,
            overdue: metrics.overdueCount,
          }}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts & Tables) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="stone-card p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Operational Performance
            </h2>
            <ComplaintsOverview
              statusData={statusData}
              categoryData={categoryData}
              trendData={trendData}
            />
          </section>

          <section className="stone-card shadow-md overflow-hidden">
            <TeamOverview staff={staffData} />
          </section>
        </div>

        {/* Right Column (Sidebar/Feeds) */}
        <div className="space-y-6">
          {/* Alerts Panel - Dynamic color based on alert type */}
          <div className="min-h-[200px] stone-card border-primary/20 bg-primary/5 p-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
              Critical Alerts
            </h3>
            <RealTimeAlerts initialAlerts={initialAlerts} />
          </div>

          {/* Activity Feed Panel */}
          <div className="min-h-[400px] stone-card p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Live Activity</h3>
            <ActivityFeed initialActivity={activityData} />
          </div>
        </div>
      </div>
    </div>
  );
}