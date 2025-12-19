// components/admin/workload-dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";

interface StaffWorkload {
  staff_id: string;
  staff_name: string;
  staff_email: string;
  role_type: string;
  total_assigned: number;
  in_progress: number;
  pending_acceptance: number;
  completed_this_month: number;
  overdue: number;
  avg_resolution_days: number;
}

export function WorkloadDashboard() {
  const [workloads, setWorkloads] = useState<StaffWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"workload" | "performance">("workload");

  useEffect(() => {
    loadWorkloadData();
  }, []);

  const loadWorkloadData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.rpc("get_staff_workload", {
        p_staff_user_id: null,
      });

      if (error) throw error;
      setWorkloads((data || []) as StaffWorkload[]);
    } catch (error) {
      console.error("Error loading workload data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedWorkloads = [...workloads].sort((a, b) => {
    if (sortBy === "workload") {
      return b.total_assigned - a.total_assigned;
    } else {
      return b.completed_this_month - a.completed_this_month;
    }
  });

  const totalStats = workloads.reduce(
    (acc, w) => ({
      total_assigned: acc.total_assigned + w.total_assigned,
      in_progress: acc.in_progress + w.in_progress,
      pending_acceptance: acc.pending_acceptance + w.pending_acceptance,
      overdue: acc.overdue + w.overdue,
      completed: acc.completed + w.completed_this_month,
    }),
    {
      total_assigned: 0,
      in_progress: 0,
      pending_acceptance: 0,
      overdue: 0,
      completed: 0,
    }
  );

  const getRoleColor = (roleType: string) => {
    const colors: Record<string, string> = {
      dept_head: "bg-purple-100 text-purple-800",
      dept_staff: "bg-blue-100 text-blue-800",
      ward_staff: "bg-green-100 text-green-800",
      field_staff: "bg-orange-100 text-orange-800",
    };
    return colors[roleType] || "bg-gray-100 text-gray-800";
  };

  const getWorkloadColor = (count: number) => {
    if (count >= 10) return "text-red-600 font-bold";
    if (count >= 5) return "text-yellow-600 font-semibold";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Staff Workload</h1>
          <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Workload</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor team capacity and assignment distribution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadWorkloadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {workloads.length}
            </div>
            <p className="text-xs text-blue-700">Team members</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assigned
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {totalStats.total_assigned}
            </div>
            <p className="text-xs text-purple-700">Active complaints</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {totalStats.pending_acceptance}
            </div>
            <p className="text-xs text-yellow-700">Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {totalStats.completed}
            </div>
            <p className="text-xs text-green-700">This month</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {totalStats.overdue}
            </div>
            <p className="text-xs text-red-700">Past SLA deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Sort by:</span>
        <Button
          variant={sortBy === "workload" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("workload")}
        >
          <ArrowUpDown className="mr-2 h-3 w-3" />
          Workload
        </Button>
        <Button
          variant={sortBy === "performance" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("performance")}
        >
          <TrendingUp className="mr-2 h-3 w-3" />
          Performance
        </Button>
      </div>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Staff Member
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    In Progress
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Overdue
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">
                    Avg. Days
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedWorkloads.map((staff) => (
                  <tr key={staff.staff_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {staff.staff_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {staff.staff_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className={getRoleColor(staff.role_type)}
                      >
                        {staff.role_type.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={getWorkloadColor(staff.total_assigned)}>
                        {staff.total_assigned}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-blue-600 font-medium">
                        {staff.in_progress}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-yellow-600 font-medium">
                        {staff.pending_acceptance}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {staff.completed_this_month}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {staff.overdue > 0 ? (
                        <span className="text-red-600 font-bold">
                          {staff.overdue}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-700">
                          {staff.avg_resolution_days.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedWorkloads.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">No staff data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-base">Workload Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {totalStats.overdue > 0 && (
              <div className="flex items-start gap-2 text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong>{totalStats.overdue}</strong> complaints are overdue
                  across the team. Consider redistributing workload or
                  escalating.
                </p>
              </div>
            )}
            {totalStats.pending_acceptance > 5 && (
              <div className="flex items-start gap-2 text-yellow-700">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong>{totalStats.pending_acceptance}</strong> complaints
                  are awaiting staff acceptance. Follow up with assigned
                  members.
                </p>
              </div>
            )}
            {workloads.some((w) => w.total_assigned > 10) && (
              <div className="flex items-start gap-2 text-orange-700">
                <Users className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Some staff members have high workloads (10+ complaints).
                  Consider redistributing to balance the team.
                </p>
              </div>
            )}
            {totalStats.overdue === 0 &&
              totalStats.pending_acceptance < 5 &&
              !workloads.some((w) => w.total_assigned > 10) && (
                <div className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Team workload is well balanced with no major issues. Great
                    work!
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}