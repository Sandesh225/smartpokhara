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
      dept_head: "bg-primary/10 text-primary border-primary/20",
      dept_staff: "bg-secondary/10 text-secondary-foreground border-secondary/20",
      ward_staff: "bg-accent-nature/10 text-accent-nature border-accent-nature/20",
      field_staff: "bg-accent/10 text-accent-foreground border-accent/20",
    };
    return colors[roleType] || "bg-muted text-muted-foreground border-border";
  };

  const getWorkloadColor = (count: number) => {
    if (count >= 10) return "text-destructive font-bold";
    if (count >= 5) return "text-secondary-foreground font-semibold";
    return "text-accent-nature";
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
            <Card key={i} className="animate-pulse bg-muted/50 border-border">
              <CardContent className="pt-6">
                <div className="h-16 rounded bg-muted" />
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
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Workload</h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
        <Card className="border-primary/20 bg-primary/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {workloads.length}
            </div>
            <p className="text-xs text-primary/70">Team members</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Assigned
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {totalStats.total_assigned}
            </div>
            <p className="text-xs text-accent/70">Active complaints</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-secondary/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">
              {totalStats.pending_acceptance}
            </div>
            <p className="text-xs text-secondary-foreground/70">Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card className="border-accent-nature/20 bg-accent-nature/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent-nature" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-nature">
              {totalStats.completed}
            </div>
            <p className="text-xs text-accent-nature/70">This month</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {totalStats.overdue}
            </div>
            <p className="text-xs text-destructive/70">Past SLA deadline</p>
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
      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    Staff Member
                  </th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    Role
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    In Progress
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    Overdue
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-muted-foreground text-[10px]">
                    Avg. Days
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedWorkloads.map((staff) => (
                  <tr key={staff.staff_id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-bold text-foreground">
                          {staff.staff_name}
                        </div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground">
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
                      <span className="text-secondary-foreground font-bold">
                        {staff.in_progress}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-secondary-foreground font-bold">
                        {staff.pending_acceptance}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3 text-accent-nature" />
                        <span className="text-accent-nature font-bold">
                          {staff.completed_this_month}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {staff.overdue > 0 ? (
                        <span className="text-destructive font-black">
                          {staff.overdue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-foreground font-medium">
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
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-accent/5 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase tracking-widest text-foreground">Workload Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm font-medium">
            {totalStats.overdue > 0 && (
              <div className="flex items-start gap-3 text-destructive bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong className="font-black">SLA ALERT:</strong> {totalStats.overdue} complaints are overdue.
                  Immediate redistribution is strictly advised.
                </p>
              </div>
            )}
            {totalStats.pending_acceptance > 5 && (
              <div className="flex items-start gap-3 text-secondary-foreground bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong className="font-black">WARNING:</strong> {totalStats.pending_acceptance} complaints are awaiting acceptance.
                  Protocols require staff to accept within 2 hours.
                </p>
              </div>
            )}
            {workloads.some((w) => w.total_assigned > 10) && (
              <div className="flex items-start gap-3 text-accent-foreground bg-accent/5 p-3 rounded-xl border border-accent/10">
                <Users className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong className="font-black">CAPACITY ALERT:</strong> High individual workloads detected (10+).
                  Rebalance assignments to optimize resolution speed.
                </p>
              </div>
            )}
            {totalStats.overdue === 0 &&
              totalStats.pending_acceptance < 5 &&
              !workloads.some((w) => w.total_assigned > 10) && (
                <div className="flex items-start gap-3 text-accent-nature bg-accent-nature/5 p-3 rounded-xl border border-accent-nature/10">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    <strong className="font-black">STATUS OK:</strong> Team workload is synchronized.
                    All SLA protocols are being met currently.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}