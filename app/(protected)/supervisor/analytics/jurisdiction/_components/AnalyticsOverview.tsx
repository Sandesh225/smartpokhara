"use client";

import { 
  BarChart2, CheckCircle2, Clock, Activity, 
  ThumbsUp, Users, TrendingUp, TrendingDown 
} from "lucide-react";

interface Metrics {
  totalComplaints: number;
  resolutionRate: number;
  avgResolutionTime: number;
  slaCompliance: number;
  citizenSatisfaction: number;
}

export function AnalyticsOverview({ metrics }: { metrics: Metrics }) {
  const cards = [
    {
      label: "Total Complaints",
      value: metrics.totalComplaints,
      change: "+12%",
      trend: "up",
      icon: BarChart2,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20"
    },
    {
      label: "Resolution Rate",
      value: `${metrics.resolutionRate}%`,
      change: "+5%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-success-green",
      bg: "bg-success-green/10",
      border: "border-success-green/20"
    },
    {
      label: "Avg Resolution Time",
      value: `${metrics.avgResolutionTime}h`,
      change: "-2h", // Lower is better
      trend: "down", // Good trend
      icon: Clock,
      color: "text-info-blue",
      bg: "bg-info-blue/10",
      border: "border-info-blue/20"
    },
    {
      label: "SLA Compliance",
      value: `${metrics.slaCompliance}%`,
      change: "-1%",
      trend: "down", // Bad trend
      icon: Activity,
      color: metrics.slaCompliance < 90 ? "text-warning-amber" : "text-success-green",
      bg: metrics.slaCompliance < 90 ? "bg-warning-amber/10" : "bg-success-green/10",
      border: metrics.slaCompliance < 90 ? "border-warning-amber/20" : "border-success-green/20"
    },
    {
      label: "Satisfaction",
      value: metrics.citizenSatisfaction.toFixed(1),
      change: "+0.2",
      trend: "up",
      icon: ThumbsUp,
      color: "text-warning-amber",
      bg: "bg-warning-amber/10",
      border: "border-warning-amber/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2 xl:p-2.5 rounded-lg border ${card.bg} ${card.color} ${card.border || "border-transparent"}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className={`flex items-center text-xs font-bold ${
               // Logic: if metric is 'time', down is green. Else up is green.
               (card.label.includes("Time") ? card.trend === "down" : card.trend === "up") 
               ? "text-success-green" : "text-destructive"
            }`}>
              {card.change}
              {card.trend === "up" ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
            </div>
          </div>
          <div>
            <span className="text-xl lg:text-3xl font-black text-foreground">{card.value}</span>
            <p className="text-xs lg:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}