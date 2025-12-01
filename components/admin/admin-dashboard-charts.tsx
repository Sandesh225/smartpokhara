"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import type { ComplaintListItem } from "@/lib/types/complaints";
import type { DashboardStats } from "@/lib/types/admin";

interface AdminDashboardChartsProps {
  stats: DashboardStats;
  recentComplaints: ComplaintListItem[];
}

const statusColors: Record<string, string> = {
  Pending: "#f59e0b",
  "In Progress": "#8b5cf6",
  Resolved: "#10b981",
  Escalated: "#ef4444",
};

export function AdminDashboardCharts({
  stats,
  recentComplaints,
}: AdminDashboardChartsProps) {
  const statusData = [
    { label: "Pending", value: stats.pending, fill: statusColors.Pending },
    {
      label: "In Progress",
      value: stats.in_progress,
      fill: statusColors["In Progress"],
    },
    { label: "Resolved", value: stats.resolved, fill: statusColors.Resolved },
    {
      label: "Escalated",
      value: stats.escalated,
      fill: statusColors.Escalated,
    },
  ];

  const activityMap = new Map<string, number>();
  recentComplaints.forEach((c) => {
    const d = new Date(c.submitted_at);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  });

  const activityData = Array.from(activityMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, count]) => ({ date, count }));

  const activitySubtitle =
    activityData.length === 0
      ? "No recent complaint activity yet"
      : `Last ${activityData.length} days with activity`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Complaints by Status */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-base">Complaints by Status</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current distribution across lifecycle stages
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {stats.total === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No complaints recorded yet
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activitySubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {activityData.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-center">
                <TrendingUp className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No recent activity
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "4 2" }}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#3b82f6",
                      strokeWidth: 3,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
