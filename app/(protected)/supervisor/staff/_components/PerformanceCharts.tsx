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
    { name: "Potholes", value: 12, fill: "#3B82F6" },
    { name: "Drainage", value: 8, fill: "#F59E0B" },
    { name: "Streetlight", value: 5, fill: "#10B981" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Resolutions This Week</h3>
        <LineChart 
          data={resolutionTrend} 
          xKey="date" 
          series={[{ key: "count", name: "Resolved", color: "#3B82F6" }]}
          height={250}
        />
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Focus Areas (Category)</h3>
        <BarChart 
          data={categoryBreakdown} 
          xKey="name" 
          series={[{ key: "value", name: "Tasks", color: "#6366f1" }]}
          height={250}
        />
      </div>
    </div>
  );
}