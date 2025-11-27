// components/admin/admin-dashboard-stats.tsx
"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertCircle, CheckCircle, Clock, Users, AlertTriangle, Timer } from "lucide-react";
import type { DashboardStats } from "@/lib/types/admin";

interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}

interface AdminDashboardStatsProps {
  stats: DashboardStats;
}

export function AdminDashboardStats({ stats }: AdminDashboardStatsProps) {
  const items: StatItem[] = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
      color: "text-blue-600"
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      color: "text-amber-600"
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: <Timer className="h-5 w-5 text-purple-600" />,
      color: "text-purple-600"
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      color: "text-green-600"
    },
    {
      label: "Closed",
      value: stats.closed,
      icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
      color: "text-emerald-600"
    },
    {
      label: "Escalated",
      value: stats.escalated,
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      color: "text-orange-600"
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      color: "text-red-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => (
        <Card key={item.label} className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                {item.label}
              </CardTitle>
              {item.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value.toLocaleString()}
            </div>
            {item.label === "Resolved" && stats.avg_resolution_days > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Avg: {stats.avg_resolution_days.toFixed(1)} days
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}