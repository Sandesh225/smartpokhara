// components/admin/enhanced-admin-dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";
import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts";
import { RecentComplaintsTable } from "@/components/admin/recent-complaints-table";
import { PriorityAlertsPanel } from "@/components/admin/priority-alerts-panel";
import { WardHeatmap } from "@/components/admin/ward-heatmap";
import type {
  DashboardStats,
  DepartmentWorkload,
  StaffWorkload,
  PriorityAlert,
  WardSummary,
} from "@/lib/types/admin";
import type { ComplaintListItem } from "@/lib/types/complaints";
import {
  Users,
  Building2,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-service";

interface RecentComplaintRow {
  id: string;
  tracking_code: string;
  title: string;
  status: ComplaintListItem["status"];
  priority: ComplaintListItem["priority"];
  submitted_at: string;
  category_name: string | null;
  ward_number: number | null;
  citizen_full_name: string | null;
  citizen_email: string | null;
  assigned_staff_name: string | null;
  is_overdue: boolean;
}

export function EnhancedAdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for all dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintListItem[]>(
    []
  );
  const [deptWorkload, setDeptWorkload] = useState<DepartmentWorkload[]>([]);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload[]>([]);
  const [priorityAlerts, setPriorityAlerts] = useState<PriorityAlert[]>([]);
  const [wardSummary, setWardSummary] = useState<WardSummary[]>([]);

  const loadDashboardData = async () => {
    const isLoading = !refreshing;
    if (isLoading) setLoading(true);
    setRefreshing(true);

    try {
      // Execute all API calls in parallel
      const [statsRes, recentRes, deptRes, staffRes, alertsRes, wardsRes] =
        await Promise.allSettled([
          supabase.rpc("get_dashboard_stats"),
          supabase.rpc("get_recent_complaints", { p_limit: 15 }),
          supabase.rpc("get_department_workload"),
          supabase.rpc("get_staff_workload"),
          supabase.rpc("get_priority_alerts", { p_limit: 10 }),
          supabase.rpc("get_ward_complaint_summary"),
        ]);

      // Process stats
      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setStats(statsRes.value.data);
      }

      // Process recent complaints
      if (recentRes.status === "fulfilled" && recentRes.value.data) {
        const mappedRecent: ComplaintListItem[] = recentRes.value.data.map(
          (row: RecentComplaintRow) => ({
            id: row.id,
            tracking_code: row.tracking_code,
            title: row.title,
            status: row.status,
            priority: row.priority,
            submitted_at: row.submitted_at,
            category_name: row.category_name ?? undefined,
            ward_number: row.ward_number ?? undefined,
            citizen_name: row.citizen_full_name ?? undefined,
            citizen_email: row.citizen_email ?? undefined,
            assigned_staff_name: row.assigned_staff_name ?? undefined,
            is_overdue: row.is_overdue,
          })
        );
        setRecentComplaints(mappedRecent);
      }

      // Process department workload
      if (deptRes.status === "fulfilled" && deptRes.value.data) {
        setDeptWorkload(deptRes.value.data);
      }

      // Process staff workload
      if (staffRes.status === "fulfilled" && staffRes.value.data) {
        setStaffWorkload(staffRes.value.data);
      }

      // Process priority alerts
      if (alertsRes.status === "fulfilled" && alertsRes.value.data) {
        setPriorityAlerts(alertsRes.value.data);
      }

      // Process ward summary
      if (wardsRes.status === "fulfilled" && wardsRes.value.data) {
        setWardSummary(wardsRes.value.data);
      }

      if (refreshing) {
        showSuccessToast("Dashboard data refreshed");
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      showErrorToast("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Default stats if none loaded
  const displayStats: DashboardStats = stats || {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    escalated: 0,
    overdue: 0,
    avg_resolution_days: 0,
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Executive Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time overview of city operations and complaint management
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          variant="outline"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Priority Alerts */}
      <PriorityAlertsPanel alerts={priorityAlerts} />

      {/* Stats Grid */}
      <AdminDashboardStats stats={displayStats} />

      {/* Charts and Map Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Charts */}
        <AdminDashboardCharts
          stats={displayStats}
          recentComplaints={recentComplaints}
        />

        {/* Ward Heatmap */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5" />
              Complaint Distribution by Ward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WardHeatmap wardData={wardSummary} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Complaints</CardTitle>
            <Link href="/admin/complaints">
              <Button variant="outline" size="sm">
                View All Complaints
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <RecentComplaintsTable complaints={recentComplaints} />
        </CardContent>
      </Card>

      {/* Department and Staff Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Workload */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-5 w-5" />
                  Department Workload
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  Active complaints per department
                </p>
              </div>
              <Link href="/admin/departments">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <DepartmentWorkloadTable workload={deptWorkload} />
          </CardContent>
        </Card>

        {/* Staff Performance */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5" />
                  Staff Performance
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  Top performers this month
                </p>
              </div>
              <Link href="/admin/staff">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <StaffPerformanceTable staff={staffWorkload.slice(0, 8)} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel />
    </div>
  );
}

// Skeleton loader
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-7 w-12 animate-pulse rounded bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader>
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            </CardHeader>
            <CardContent>
              <div className="h-64 animate-pulse rounded bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Department Workload Table Component
function DepartmentWorkloadTable({
  workload,
}: {
  workload: DepartmentWorkload[];
}) {
  if (workload.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        No department workload data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
              Department
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
              Total
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
              Open
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
              Overdue
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
              Avg Days
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {workload.map((dept) => (
            <tr key={dept.department_id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                {dept.department_name}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                {dept.total_complaints}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-medium text-blue-600">
                  {dept.open_complaints}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {dept.overdue_complaints > 0 ? (
                  <span className="font-medium text-red-600">
                    {dept.overdue_complaints}
                  </span>
                ) : (
                  <span className="text-slate-400">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                {dept.avg_resolution_days.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Staff Performance Table Component
function StaffPerformanceTable({ staff }: { staff: StaffWorkload[] }) {
  if (staff.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        No staff performance data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
              Staff Member
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
              Active
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
              Overdue
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
              Resolved
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staff.map((person) => (
            <tr key={person.staff_id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {person.staff_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {person.department_name || "N/A"}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-medium text-blue-600">
                  {person.active_complaints}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {person.overdue_complaints > 0 ? (
                  <span className="font-medium text-red-600">
                    {person.overdue_complaints}
                  </span>
                ) : (
                  <span className="text-slate-400">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-medium text-green-600">
                  {person.resolved_this_month}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Quick Actions Panel
function QuickActionsPanel() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link href="/admin/complaints?status=submitted">
            <Button variant="outline" className="w-full justify-start">
              View New Complaints
            </Button>
          </Link>
          <Link href="/admin/complaints?overdue=true">
            <Button variant="outline" className="w-full justify-start">
              View Overdue
            </Button>
          </Link>
          <Link href="/admin/complaints/create">
            <Button variant="outline" className="w-full justify-start">
              Create Complaint
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" className="w-full justify-start">
              Generate Report
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}