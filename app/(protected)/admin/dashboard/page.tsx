// app/(protected)/admin/dashboard/page.tsx
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import {
  AlertCircle,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

import ComplaintTrendChart from "@/components/admin/dashboard/ComplaintTrendChart";
import DepartmentWorkloadChart from "@/components/admin/dashboard/DepartmentWorkloadChart";
import QuickActions from "@/components/admin/dashboard/QuickActions";

async function getDashboardData() {
  const supabase = await createClient();

  // Dashboard summary from RPC
  const { data: summary } = await supabase.rpc(
    "rpc_admin_get_dashboard_summary",
    {
      p_date_from: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }
  );

  // Complaint trend data
  const { data: trend } = await supabase.rpc("rpc_admin_get_complaints_trend", {
    p_period: "weekly",
    p_date_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Department workload (for chart)
  const { data: departments } = await supabase
    .from("departments")
    .select(
      `
        id,
        name,
        complaints:complaints(
          id,
          status,
          sla_due_at
        )
      `
    )
    .eq("is_active", true);

  return {
    summary: (summary as any)?.data || null,
    trend: trend || [],
    departments: departments || [],
  };
}

export default async function AdminDashboardPage() {
  const dashboardData = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          System overview and quick controls for Smart City Pokhara
          administration
        </p>
      </div>

      {/* Quick Stats */}
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Complaints */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Complaints
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.summary?.complaints?.total ?? 0}
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className="text-green-600 mr-1">↑ 12%</span>
                <span>from last month</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {dashboardData.summary?.complaints?.active ?? 0} active
              </div>
            </CardContent>
          </Card>

          {/* SLA Compliance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                SLA Compliance
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.summary?.complaints?.sla_compliance_rate ?? 0}%
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                {dashboardData.summary?.complaints?.overdue ?? 0} overdue
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {dashboardData.summary?.complaints?.avg_resolution_hours ?? 0}{" "}
                avg hours to resolve
              </div>
            </CardContent>
          </Card>

          {/* Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.summary?.users?.total_citizens ?? 0}
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                {dashboardData.summary?.users?.new_registrations_today ?? 0} new
                today
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {dashboardData.summary?.users?.total_staff ?? 0} staff users
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Collected
              </CardTitle>
              <CreditCard className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR{" "}
                {dashboardData.summary?.payments?.total_collected
                  ? dashboardData.summary.payments.total_collected.toLocaleString()
                  : 0}
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                {dashboardData.summary?.payments?.success_rate ?? 0}% success
                rate
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {dashboardData.summary?.payments?.pending_transactions ?? 0}{" "}
                pending
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>

      {/* Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Complaints Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplaintTrendChart data={dashboardData.trend} />
          </CardContent>
        </Card>

        {/* Department Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Department Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentWorkloadChart departments={dashboardData.departments} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.summary?.recent_activity
              ?.slice(0, 5)
              .map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === "complaint"
                        ? "bg-blue-100 text-blue-600"
                        : activity.type === "task"
                          ? "bg-green-100 text-green-600"
                          : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {activity.type === "complaint" && (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {activity.type === "task" && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {activity.type === "payment" && (
                      <CreditCard className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.user_name} •{" "}
                      {activity.timestamp
                        ? format(new Date(activity.timestamp), "MMM d, h:mm a")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-3 w-[140px] mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
