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
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "SLA Compliance",
      value: `${metrics.slaCompliance}%`,
      icon: TrendingUp,
      color: metrics.slaCompliance >= 90 ? "text-green-600" : "text-amber-600",
      bg: metrics.slaCompliance >= 90 ? "bg-green-50" : "bg-amber-50"
    },
    {
      label: "Avg Resolution",
      value: `${metrics.avgResolutionTime}h`,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "Rating",
      value: metrics.avgRating.toFixed(1),
      icon: ThumbsUp,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
          <div className={`p-3 rounded-full mb-3 ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}