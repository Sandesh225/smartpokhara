"use client";

import { CheckCircle2, TrendingUp, BarChart3, Star } from "lucide-react";
import { UniversalStatCard } from "@/components/shared/UniversalStatCard";

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
      bg: "bg-blue-100 dark:bg-blue-500/20",
    },
    {
      label: "Monthly Total",
      value: stats.totalCompleted || 0,
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-500/20",
    },
    {
      label: "SLA Score",
      value: `${stats.slaCompliance || 0}%`,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-500/20",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating ? stats.avgRating.toFixed(1) : "5.0",
      icon: Star,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {metrics.map((m) => (
        <UniversalStatCard
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            color={m.color}
            bg={m.bg}
            variant="compact"
            className={m.color === "text-blue-600 dark:text-blue-400" ? "border-blue-100 dark:border-blue-500/20" : 
                       m.color === "text-purple-600 dark:text-purple-400" ? "border-purple-100 dark:border-purple-500/20" :
                       m.color === "text-green-600 dark:text-green-400" ? "border-green-100 dark:border-green-500/20" :
                       "border-amber-100 dark:border-amber-500/20"}
        />
      ))}
    </div>
  );
}