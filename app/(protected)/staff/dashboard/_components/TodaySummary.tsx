"use client";

import { CheckCircle2, TrendingUp, BarChart3, Star } from "lucide-react";

interface DashboardStats {
  completed_today: number;
  totalCompleted: number;
  slaCompliance: number;
  avgResolutionTime: number;
  avgRating: number;
}

export function TodaySummary({ stats }: { stats: DashboardStats }) {
  const metrics = [
    {
      label: "Completed Today",
      value: stats.completed_today || 0,
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-500/20",
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
    },
    {
      label: "Monthly Total",
      value: stats.totalCompleted || 0,
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-100 dark:border-purple-500/20",
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
    },
    {
      label: "SLA Score",
      value: `${stats.slaCompliance || 0}%`,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10",
      border: "border-green-100 dark:border-green-500/20",
      iconBg: "bg-green-100 dark:bg-green-500/20",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating ? stats.avgRating.toFixed(1) : "5.0",
      icon: Star,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-500/20",
      iconBg: "bg-amber-100 dark:bg-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {metrics.map((m) => (
        <div
          key={m.label}
          className={`bg-card rounded-xl border p-4 lg:p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-0.5 ${m.border}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-lg transition-colors ${m.iconBg}`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
          </div>

          <div>
            <h4 className="text-2xl lg:text-3xl font-bold text-foreground tabular-nums tracking-tight">
              {m.value}
            </h4>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">
              {m.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}