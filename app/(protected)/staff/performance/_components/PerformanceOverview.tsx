"use client";

import { CheckCircle2, Clock, ThumbsUp, TrendingUp } from "lucide-react";

interface Metrics {
  totalCompleted: number;
  slaCompliance: number;
  avgResolutionTime: number;
  avgRating: number;
}

export function PerformanceOverview({ metrics }: { metrics: Metrics }) {
  const stats = [
    {
      label: "Tasks Completed",
      value: metrics.totalCompleted,
      icon: CheckCircle2,
      color: "text-info-blue",
      bg: "bg-info-blue/10"
    },
    {
      label: "SLA Compliance",
      value: `${metrics.slaCompliance}%`,
      icon: TrendingUp,
      color: metrics.slaCompliance >= 90 ? "text-success-green" : "text-warning-amber",
      bg: metrics.slaCompliance >= 90 ? "bg-success-green/10" : "bg-warning-amber/10"
    },
    {
      label: "Avg Resolution",
      value: `${metrics.avgResolutionTime}h`,
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "Rating",
      value: metrics.avgRating.toFixed(1),
      icon: ThumbsUp,
      color: "text-warning-amber",
      bg: "bg-warning-amber/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card p-5 rounded-xl border border-border shadow-xs flex flex-col items-center text-center transition-all hover:shadow-md group">
          <div className={`p-3 rounded-full mb-3 shrink-0 border border-current/10 transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tight">{stat.value}</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}