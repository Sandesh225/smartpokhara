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

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = "force-dynamic";

export default async function SupervisorDashboard() {
  // 1. Auth Check & User Context
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  // 2. Create Server-Side Supabase Client (Handles Cookies)
  const supabase = await createClient();

  // 3. Parallel Data Fetching
  // CRITICAL: We pass 'user.id' to EVERY query to enforce jurisdiction filtering.
  const [
    metrics,
    statusData,
    categoryData,
    trendData,
    activityData,
    staffData,
  ] = await Promise.all([
    // Operational Counters (Active, Overdue, etc.)
    supervisorAnalyticsQueries.getComplaintMetrics(supabase, user.id),
    
    // Charts Data - Now scoped to department!
    supervisorAnalyticsQueries.getStatusDistribution(supabase, user.id),
    supervisorAnalyticsQueries.getCategoryBreakdown(supabase, user.id),
    supervisorAnalyticsQueries.getTrendData(supabase, user.id),
    
    // Feeds & Lists
    supervisorAnalyticsQueries.getRecentActivity(supabase, user.id),
    supervisorStaffQueries.getSupervisedStaff(supabase, user.id),
  ]);

  // 4. Construct Alerts based on live metrics
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
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Monitor complaints, team performance, and key metrics for your jurisdiction.
        </p>
      </div>

      {/* Header Metrics Cards */}
      <DashboardMetrics metrics={metrics} />

      {/* Quick Actions Bar */}
      <QuickActions
        counts={{
          unassigned: metrics.unassignedCount,
          overdue: metrics.overdueCount,
        }}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts & Tables) - Spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Section */}
          <ComplaintsOverview
            statusData={statusData}
            categoryData={categoryData}
            trendData={trendData}
          />

          {/* Staff Table */}
          <TeamOverview staff={staffData} />
        </div>

        {/* Right Column (Sidebar) - Spans 1 col */}
        <div className="space-y-6">
          {/* Alerts Panel */}
          <div className="min-h-[200px]">
            <RealTimeAlerts initialAlerts={initialAlerts} />
          </div>

          {/* Activity Feed Panel */}
          <div className="min-h-[400px]">
            <ActivityFeed initialActivity={activityData} />
          </div>
        </div>
      </div>
    </div>
  );
}