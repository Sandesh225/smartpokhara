"use client";

import { AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";

interface SLAMetrics {
  totalActive: number;
  onTimeCount: number;
  atRiskCount: number;
  overdueCount: number;
  complianceRate: number;
}

export function SLAOverviewCards({ metrics }: { metrics: SLAMetrics }) {
  const cards = [
    {
      label: "Compliance Rate",
      value: `${metrics.complianceRate}%`,
      icon: TrendingUp,
      color: metrics.complianceRate >= 90 ? "text-green-600" : "text-amber-600",
      bg: metrics.complianceRate >= 90 ? "bg-green-50" : "bg-amber-50"
    },
    {
      label: "On Time",
      value: metrics.onTimeCount,
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "At Risk (< 24h)",
      value: metrics.atRiskCount,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
      pulse: true
    },
    {
      label: "Overdue",
      value: metrics.overdueCount,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${card.bg} ${card.color} ${card.pulse ? 'animate-pulse' : ''}`}>
            <card.icon className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  );
}