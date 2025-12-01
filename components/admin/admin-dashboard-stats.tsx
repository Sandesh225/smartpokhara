"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Timer,
  TrendingUp,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types/admin";

interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  bgColor: string;
  iconBg: string;
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
      label: "Total",
      value: stats.total,
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-blue-700 dark:text-blue-300",
      bgColor:
        "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      trend: { value: 12, isPositive: false },
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="h-5 w-5" />,
      color: "text-amber-700 dark:text-amber-300",
      bgColor:
        "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200/50 dark:border-amber-800/50",
      iconBg:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: <Timer className="h-5 w-5" />,
      color: "text-purple-700 dark:text-purple-300",
      bgColor:
        "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200/50 dark:border-purple-800/50",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-700 dark:text-emerald-300",
      bgColor:
        "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 border-emerald-200/50 dark:border-emerald-800/50",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      trend: { value: 8, isPositive: true },
    },
    {
      label: "Closed",
      value: stats.closed,
      icon: <XCircle className="h-5 w-5" />,
      color: "text-slate-700 dark:text-slate-300",
      bgColor:
        "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50",
      iconBg:
        "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
    },
    {
      label: "Escalated",
      value: stats.escalated,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-orange-700 dark:text-orange-300",
      bgColor:
        "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200/50 dark:border-orange-800/50",
      iconBg:
        "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: <AlertCircle className="h-5 w-5" />,
      color: "text-red-700 dark:text-red-300",
      bgColor:
        "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border-red-200/50 dark:border-red-800/50",
      iconBg: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => (
        <Card
          key={item.label}
          className={cn(
            "group relative overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-default",
            item.bgColor
          )}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                  item.iconBg
                )}
              >
                {item.icon}
              </div>
              {item.trend && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium rounded-full px-1.5 py-0.5",
                    item.trend.isPositive
                      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/30"
                      : "text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/30"
                  )}
                >
                  {item.trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{item.trend.value}%</span>
                </div>
              )}
            </div>
            <div>
              <p
                className={cn(
                  "text-2xl sm:text-3xl font-bold tracking-tight",
                  item.color
                )}
              >
                {item.value.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                {item.label}
              </p>
              {item.label === "Resolved" && avg_resolution_days > 0 && (
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Avg: {avg_resolution_days.toFixed(1)} days
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
