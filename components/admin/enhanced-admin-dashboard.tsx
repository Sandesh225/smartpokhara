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
  MapPin,
  RefreshCw,
  UserPlus,
  Mail,
  Upload,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  ArrowRight,
  Activity,
  Sparkles,
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

interface StaffStats {
  totalStaff: number;
  pendingInvitations: number;
  activeStaff: number;
  newThisMonth: number;
}

export function EnhancedAdminDashboard() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staffStats, setStaffStats] = useState<StaffStats>({
    totalStaff: 0,
    pendingInvitations: 0,
    activeStaff: 0,
    newThisMonth: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<ComplaintListItem[]>(
    []
  );
  const [deptWorkload, setDeptWorkload] = useState<DepartmentWorkload[]>([]);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload[]>([]);
  const [priorityAlerts, setPriorityAlerts] = useState<PriorityAlert[]>([]);
  const [wardSummary, setWardSummary] = useState<WardSummary[]>([]);

  const loadStaffStats = async () => {
    try {
      const staffRoles = await supabase
        .from("roles")
        .select("id")
        .in("role_type", [
          "admin",
          "dept_head",
          "dept_staff",
          "ward_staff",
          "field_staff",
          "call_center",
        ]);

      const roleIds = staffRoles.data?.map((r) => r.id) || [];

      const { count: totalCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .in("role_id", roleIds);

      const { count: pendingCount } = await supabase
        .from("staff_invitations")
        .select("*", { count: "exact", head: true })
        .eq("is_used", false)
        .gt("expires_at", new Date().toISOString());

      const { data: activeStaff } = await supabase
        .from("user_roles")
        .select(
          `
          user_id,
          users!inner(is_active)
        `
        )
        .in("role_id", roleIds)
        .eq("users.is_active", true);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .in("role_id", roleIds)
        .gte("assigned_at", startOfMonth.toISOString());

      setStaffStats({
        totalStaff: totalCount || 0,
        pendingInvitations: pendingCount || 0,
        activeStaff: activeStaff?.length || 0,
        newThisMonth: newCount || 0,
      });
    } catch (error) {
      console.error("Error loading staff stats:", error);
    }
  };

  const loadDashboardData = async () => {
    const isFirstLoad = !refreshing;
    if (isFirstLoad) setLoading(true);
    setRefreshing(true);

    try {
      const [statsRes, recentRes, deptRes, staffRes, alertsRes, wardsRes] =
        await Promise.allSettled([
          supabase.rpc("get_dashboard_stats"),
          supabase.rpc("get_recent_complaints", { p_limit: 15 }),
          supabase.rpc("get_department_workload"),
          supabase.rpc("get_staff_workload"),
          supabase.rpc("get_priority_alerts", { p_limit: 10 }),
          supabase.rpc("get_ward_complaint_summary"),
        ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setStats(statsRes.value.data);
      }

      if (recentRes.status === "fulfilled" && recentRes.value.data) {
        const mapped: ComplaintListItem[] = recentRes.value.data.map(
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
        setRecentComplaints(mapped);
      }

      if (deptRes.status === "fulfilled" && deptRes.value.data) {
        setDeptWorkload(deptRes.value.data);
      }
      if (staffRes.status === "fulfilled" && staffRes.value.data) {
        setStaffWorkload(staffRes.value.data);
      }
      if (alertsRes.status === "fulfilled" && alertsRes.value.data) {
        setPriorityAlerts(alertsRes.value.data);
      }
      if (wardsRes.status === "fulfilled" && wardsRes.value.data) {
        setWardSummary(wardsRes.value.data);
      }

      await loadStaffStats();
      setLastUpdated(new Date());

      if (!isFirstLoad) {
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
    void loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="space-y-8 animate-fade-in">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Real-time visibility into complaints, staff workload & ward
            performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <Button
            onClick={loadDashboardData}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin-custom" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing…" : "Refresh Data"}
            </span>
            <span className="sm:hidden">Refresh</span>
          </Button>

          <Link href="/admin/analytics">
            <Button variant="primary" size="sm" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Priority Alerts */}
      {priorityAlerts.length > 0 && (
        <div className="animate-slide-up">
          <PriorityAlertsPanel alerts={priorityAlerts} />
        </div>
      )}

      {/* KPI Row */}
      <div className="animate-slide-up">
        <AdminDashboardStats stats={displayStats} />
      </div>

      {/* Staff Overview */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-sm animate-slide-up">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base text-slate-900 dark:text-slate-50">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Staff Overview
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Operational capacity across all administrative roles.
              </span>
            </CardTitle>
            <Link href="/admin/staff">
              <Button variant="outline" size="sm">
                Manage Staff
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "Total Staff",
                value: staffStats.totalStaff,
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-100/80",
              },
              {
                label: "Active Staff",
                value: staffStats.activeStaff,
                icon: CheckCircle,
                color: "text-emerald-600",
                bg: "bg-emerald-100/80",
              },
              {
                label: "Pending Invites",
                value: staffStats.pendingInvitations,
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-100/80",
              },
              {
                label: "New This Month",
                value: `+${staffStats.newThisMonth}`,
                icon: TrendingUp,
                color: "text-purple-600",
                bg: "bg-purple-100/80",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${item.bg} flex items-center justify-center`}
                  >
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight">
                      {item.value}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {item.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/staff?action=invite">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite Staff
              </Button>
            </Link>
            <Link href="/admin/staff?action=bulk">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            </Link>
            <Link href="/admin/staff?tab=invitations">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Invitations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts & Heatmap */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up">
        <AdminDashboardCharts
          stats={displayStats}
          recentComplaints={recentComplaints}
        />

        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              Ward Complaint Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WardHeatmap wardData={wardSummary} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Recent Complaints */}
      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up">
        {/* Quick Actions */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Common administrative tasks
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Link href="/admin/complaints?status=pending" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-3 px-4 hover:bg-amber-50 dark:hover:bg-amber-950/30 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Pending Review
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {displayStats.pending} complaints waiting
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                </Button>
              </Link>

              <Link href="/admin/complaints?overdue=true" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-3 px-4 hover:bg-red-50 dark:hover:bg-red-950/30 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                      <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Overdue Items
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {displayStats.overdue} need attention
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                </Button>
              </Link>

              <Link href="/admin/analytics" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        View Analytics
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Detailed performance metrics
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </Button>
              </Link>

              <Link href="/admin/complaints/map" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-3 px-4 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Map View
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Geographic visualization
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Recent Complaints Activity
                  </CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Latest submissions requiring attention
                  </p>
                </div>
              </div>
              <Link href="/admin/complaints">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <RecentComplaintsTable complaints={recentComplaints} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton loader while initial data loads
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-7 w-44 rounded-lg bg-slate-200 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded-lg bg-slate-200 animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-slate-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card
            key={i}
            className="border-slate-200 shadow-sm bg-slate-50/60 dark:bg-slate-900/50"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-5 w-5 rounded-full bg-slate-200 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-7 w-12 rounded bg-slate-200 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card
            key={i}
            className="border-slate-200 shadow-sm bg-slate-50/60 dark:bg-slate-900/50"
          >
            <CardHeader>
              <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
