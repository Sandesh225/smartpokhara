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
    { label: "Total Resolved", value: metrics.totalResolved, icon: CheckCircle2, color: "text-success-green", bg: "bg-success-green/10" },
    { label: "Avg Resolution", value: `${metrics.avgTime}h`, icon: Clock, color: "text-info-blue", bg: "bg-info-blue/10" },
    { label: "SLA Compliance", value: `${metrics.slaCompliance}%`, icon: AlertTriangle, color: metrics.slaCompliance < 90 ? "text-warning-amber" : "text-success-green", bg: metrics.slaCompliance < 90 ? "bg-warning-amber/10" : "bg-success-green/10" },
    { label: "Avg Rating", value: metrics.rating.toFixed(1), icon: Star, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-card p-4 rounded-xl border border-border shadow-xs flex items-center gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${c.bg} ${c.color}`}>
            <c.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}