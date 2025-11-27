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
import type {
  DashboardStats,
  DepartmentWorkload,
  StaffWorkload,
} from "@/lib/types/admin";
import type { ComplaintListItem } from "@/lib/types/complaints";
import { Users, Building2, AlertCircle, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-service";

export function EnhancedAdminDashboard() {
  const supabase = createClient();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintListItem[]>([]);
  const [deptWorkload, setDeptWorkload] = useState<DepartmentWorkload[]>([]);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      // Load all data in parallel
      const [
        statsRes,
        recentRes,
        deptRes,
        staffRes,
      ] = await Promise.allSettled([
        supabase.rpc("get_dashboard_stats"),
        supabase.rpc("get_recent_complaints", { p_limit: 15 }),
        supabase.rpc("get_department_workload"),
        supabase.rpc("get_staff_workload"),
      ]);

      // Handle stats
      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data as DashboardStats);
      } else {
        console.error("Error loading dashboard stats:", statsRes.status === 'fulfilled' ? statsRes.value.error : statsRes.reason);
        showErrorToast("Failed to load dashboard overview.");
      }

      // Handle recent complaints
      if (recentRes.status === 'fulfilled' && recentRes.value.data) {
        const data = recentRes.value.data as any[];
        const mappedRecent: ComplaintListItem[] = data.map((row) => ({
          id: row.id,
          tracking_code: row.tracking_code,
          title: row.title,
          status: row.status,
          priority: row.priority,
          submitted_at: row.submitted_at,
          category_name: row.category_name,
          ward_number: row.ward_number,
          citizen_name: row.citizen_full_name,
          citizen_email: row.citizen_email,
          assigned_staff_name: row.assigned_staff_name,
          is_overdue: row.is_overdue,
        }));
        setRecentComplaints(mappedRecent);
      } else {
        console.error("Error loading recent complaints:", recentRes.status === 'fulfilled' ? recentRes.value.error : recentRes.reason);
      }

      // Handle department workload
      if (deptRes.status === 'fulfilled' && deptRes.value.data) {
        setDeptWorkload(deptRes.value.data as DepartmentWorkload[]);
      } else {
        console.error("Error loading department workload:", deptRes.status === 'fulfilled' ? deptRes.value.error : deptRes.reason);
      }

      // Handle staff workload
      if (staffRes.status === 'fulfilled' && staffRes.value.data) {
        const data = staffRes.value.data as StaffWorkload[];
        setStaffWorkload(data.slice(0, 10));
      } else {
        console.error("Error loading staff workload:", staffRes.status === 'fulfilled' ? staffRes.value.error : staffRes.reason);
      }

    } catch (err) {
      console.error("Unexpected error loading dashboard:", err);
      showErrorToast("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Overview of complaints and system performance
            </p>
          </div>
          <Button variant="outline" disabled>
            Loading...
          </Button>
        </div>
        
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-5 w-5 animate-pulse rounded bg-slate-200"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Overview of complaints and system performance
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats row */}
      <AdminDashboardStats stats={displayStats} />

      {/* Charts row */}
      <AdminDashboardCharts stats={displayStats} recentComplaints={recentComplaints} />

      {/* Recent complaints table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentComplaintsTable complaints={recentComplaints} />
        </CardContent>
      </Card>

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
                Manage Departments
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {deptWorkload.length > 0 ? (
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
                      Avg Resolution (days)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptWorkload.map((dept) => (
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
                        {typeof dept.avg_resolution_days === "number"
                          ? dept.avg_resolution_days.toFixed(1)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              No department workload data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Workload */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5" />
                Staff Performance (Top 10)
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Most active staff members
              </p>
            </div>
            <Link href="/admin/staff">
              <Button variant="outline" size="sm">
                View All Staff
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {staffWorkload.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      Staff Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      Department
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Active
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Overdue
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Resolved (Month)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffWorkload.map((staff) => (
                    <tr key={staff.staff_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            {staff.staff_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {staff.staff_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {staff.department_name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-blue-600">
                          {staff.active_complaints}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {staff.overdue_complaints > 0 ? (
                          <span className="font-medium text-red-600">
                            {staff.overdue_complaints}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-green-600">
                          {staff.resolved_this_month}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              No staff workload data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Link href="/admin/complaints">
              <Button variant="outline" className="w-full justify-start">
                Manage All Complaints
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
    </div>
  );
}