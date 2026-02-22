"use client";

import { BarChart } from "../../analytics/jurisdiction/_components/_charts/BarChart";
import { LineChart } from "../../analytics/jurisdiction/_components/_charts/LineChart";



export function PerformanceCharts() {
  // Mock Data
  const resolutionTrend = [
    { date: "Mon", count: 2 },
    { date: "Tue", count: 5 },
    { date: "Wed", count: 3 },
    { date: "Thu", count: 6 },
    { date: "Fri", count: 4 },
  ];

  const categoryBreakdown = [
    { name: "Potholes", value: 12, fill: "var(--primary)" },
    { name: "Drainage", value: 8, fill: "var(--warning-amber)" },
    { name: "Streetlight", value: 5, fill: "var(--success-green)" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card p-6 rounded-xl border border-border shadow-xs">
        <h3 className="text-sm font-bold text-foreground mb-4">Resolutions This Week</h3>
        <LineChart 
          data={resolutionTrend} 
          xKey="date" 
          series={[{ key: "count", name: "Resolved", color: "var(--primary)" }]}
          height={250}
        />
      </div>
      
      <div className="bg-card p-6 rounded-xl border border-border shadow-xs">
        <h3 className="text-sm font-bold text-foreground mb-4">Focus Areas (Category)</h3>
        <BarChart 
          data={categoryBreakdown} 
          xKey="name" 
          series={[{ key: "value", name: "Tasks", color: "var(--secondary)" }]}
          height={250}
        />
      </div>
    </div>
  );
}