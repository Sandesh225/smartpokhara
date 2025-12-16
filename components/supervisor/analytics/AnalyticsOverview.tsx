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
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Resolution Rate",
      value: `${metrics.resolutionRate}%`,
      change: "+5%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Avg Resolution Time",
      value: `${metrics.avgResolutionTime}h`,
      change: "-2h", // Lower is better
      trend: "down", // Good trend
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "SLA Compliance",
      value: `${metrics.slaCompliance}%`,
      change: "-1%",
      trend: "down", // Bad trend
      icon: Activity,
      color: metrics.slaCompliance < 90 ? "text-amber-600" : "text-green-600",
      bg: metrics.slaCompliance < 90 ? "bg-amber-50" : "bg-green-50"
    },
    {
      label: "Satisfaction",
      value: metrics.citizenSatisfaction.toFixed(1),
      change: "+0.2",
      trend: "up",
      icon: ThumbsUp,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className={`flex items-center text-xs font-medium ${
               // Logic: if metric is 'time', down is green. Else up is green.
               (card.label.includes("Time") ? card.trend === "down" : card.trend === "up") 
               ? "text-green-600" : "text-red-600"
            }`}>
              {card.change}
              {card.trend === "up" ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">{card.value}</span>
            <p className="text-xs text-gray-500 font-medium mt-1">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}