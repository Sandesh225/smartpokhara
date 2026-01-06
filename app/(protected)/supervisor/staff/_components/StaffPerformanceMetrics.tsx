"use client";

import { CheckCircle2, Clock, AlertTriangle, Star } from "lucide-react";

interface Props {
  metrics: {
    totalResolved: number;
    avgTime: number;
    slaCompliance: number;
    rating: number;
  };
}

export function StaffPerformanceMetrics({ metrics }: Props) {
  const cards = [
    { label: "Total Resolved", value: metrics.totalResolved, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Avg Resolution", value: `${metrics.avgTime}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "SLA Compliance", value: `${metrics.slaCompliance}%`, icon: AlertTriangle, color: metrics.slaCompliance < 90 ? "text-amber-600" : "text-green-600", bg: metrics.slaCompliance < 90 ? "bg-amber-50" : "bg-green-50" },
    { label: "Avg Rating", value: metrics.rating.toFixed(1), icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${c.bg} ${c.color}`}>
            <c.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}