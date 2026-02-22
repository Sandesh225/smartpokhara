import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorApi } from "@/features/supervisor";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./_components/DashboardContent";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";

export default async function SupervisorDashboard() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Parallel Data Fetching on Server
 // Parallel Data Fetching on Server
  const [
    metrics,
    statusData,
    categoryData,   // <-- We will fix this
    trendData,
    activityData,
    staffData,
  ] = await Promise.all([
    supervisorApi.getComplaintMetrics(supabase, user.id),
    supervisorApi.getStatusDistribution(supabase, user.id),
    
    // ❌ OLD: supervisorApi.getCategoryBreakdown(supabase),
    // ✅ NEW: Pass user.id so it filters correctly!
    supervisorApi.getCategoryBreakdown(supabase, user.id), 
    
    supervisorApi.getTrendData(supabase, user.id),
    supervisorApi.getRecentActivity(supabase, user.id),
    supervisorApi.getSupervisedStaff(supabase, user.id),
  ]);
  const alerts: any[] = [];
  if (metrics.overdueCount > 0) {
    alerts.push({
      id: "overdue-alert",
      type: "overdue",
      message: `${metrics.overdueCount} complaints have breached SLA deadlines`,
      timestamp: new Date().toISOString(),
      link: "/supervisor/complaints/overdue",
    });
  }

  if (metrics.unassignedCount > 0) {
    alerts.push({
      id: "unassigned-alert",
      type: "unassigned",
      message: `${metrics.unassignedCount} complaints waiting for assignment`,
      timestamp: new Date().toISOString(),
      link: "/supervisor/complaints/unassigned",
    });
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent 
        initialUserId={user.id}
        metrics={metrics}
        statusData={statusData}
        categoryData={categoryData}
        trendData={trendData}
        activityData={activityData}
        staffData={staffData}
        alerts={alerts}
      />
    </Suspense>
  );
}
