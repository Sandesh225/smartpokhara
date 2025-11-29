// components/admin/admin-dashboard-stats.tsx
"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Timer,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { DashboardStats } from "@/lib/types/admin";

interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface AdminDashboardStatsProps {
  stats: DashboardStats;
}

export function AdminDashboardStats({ stats }: AdminDashboardStatsProps) {
  const { avg_resolution_days = 0 } = stats;

  const items: StatItem[] = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
      color: "text-blue-600",
      trend: { value: 12, isPositive: false },
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      color: "text-amber-600",
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: <Timer className="h-5 w-5 text-purple-600" />,
      color: "text-purple-600",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      color: "text-green-600",
      trend: { value: 8, isPositive: true },
    },
    {
      label: "Closed",
      value: stats.closed,
      icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
      color: "text-emerald-600",
    },
    {
      label: "Escalated",
      value: stats.escalated,
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      color: "text-orange-600",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
      {items.map((item) => (
        <Card
          key={item.label}
          className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
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

            {/* Additional info based on stat type */}
            {item.label === "Resolved" && avg_resolution_days > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Avg: {avg_resolution_days.toFixed(1)} days
              </p>
            )}

            {item.trend && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {item.trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    item.trend.isPositive ? "text-green-600" : "text-red-600"
                  }
                >
                  {item.trend.isPositive ? "+" : ""}
                  {item.trend.value}%
                </span>
                <span className="text-slate-500">vs last week</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}