"use client";

import { CheckCircle2, TrendingUp, BarChart3, ClipboardList } from "lucide-react";
import { UniversalStatCard } from "@/components/shared/UniversalStatCard";

interface DashboardStats {
  completed_today: number;
  totalCompleted: number;
  slaCompliance: number;
  avgResolutionTime: number;
  avgRating: number;
  totalAssigned: number;
  totalDone: number;
}

export function TodaySummary({ stats }: { stats: DashboardStats }) {
  const metrics = [
    {
      label: "Total Assigned",
      value: stats.totalAssigned || 0,
      icon: ClipboardList,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completed",
      value: stats.totalDone || 0,
      icon: CheckCircle2,
      color: "text-success-green",
      bg: "bg-success-green/10",
    },
    {
      label: "Completed Today",
      value: stats.completed_today || 0,
      icon: BarChart3,
      color: "text-info-blue",
      bg: "bg-info-blue/10",
    },
    {
      label: "SLA Score",
      value: `${stats.slaCompliance || 0}%`,
      icon: TrendingUp,
      color: "text-warning-amber",
      bg: "bg-warning-amber/10",
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
            className={m.bg.replace('bg-', 'border-').replace('/10', '/20')}
        />
      ))}
    </div>
  );
}