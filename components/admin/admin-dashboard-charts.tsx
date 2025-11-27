// components/admin/admin-dashboard-charts.tsx
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintListItem } from "@/lib/types/complaints";
import type { DashboardStats } from "@/lib/types/admin";

interface AdminDashboardChartsProps {
  stats: DashboardStats;
  recentComplaints: ComplaintListItem[];
}

export function AdminDashboardCharts({
  stats,
  recentComplaints,
}: AdminDashboardChartsProps) {
  const statusData = [
    { label: "Pending", value: stats.pending },
    { label: "In Progress", value: stats.in_progress },
    { label: "Resolved", value: stats.resolved },
    { label: "Escalated", value: stats.escalated },
  ];

  const activityMap = new Map<string, number>();
  recentComplaints.forEach((c) => {
    const d = new Date(c.submitted_at);
    const key = d.toLocaleDateString();
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  });

  const activityData = Array.from(activityMap.entries())
    .sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    )
    .map(([date, count]) => ({ date, count }));

  const activitySubtitle =
    activityData.length === 0
      ? "No recent complaint activity yet."
      : `Volume of complaints received by date (last ${activityData.length} days with activity).`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Complaints by status */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Complaints by Status
          </CardTitle>
          <p className="text-xs text-slate-500">
            Current distribution of complaints across lifecycle stages.
          </p>
        </CardHeader>
        <CardContent>
          {stats.total === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
              No complaints recorded yet. Charts will appear once data is
              available.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                    cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      borderColor: "#e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Recent Activity
          </CardTitle>
          <p className="text-xs text-slate-500">{activitySubtitle}</p>
        </CardHeader>
        <CardContent>
          {activityData.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
              No recent complaint activity to display.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                      borderRadius: 8,
                      borderColor: "#e2e8f0",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
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
