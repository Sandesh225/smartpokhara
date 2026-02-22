// app/(protected)/supervisor/analytics/jurisdiction/_components/ComplaintsTrendChart.tsx
"use client";

import { LineChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/_charts/LineChart";

interface Props {
  // FIX: Explicitly using 'count' to match the database/API return type
  data: { date: string; count: number; resolved: number }[];
}

export function ComplaintsTrendChart({ data }: Props) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-xs">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-foreground">Complaint Volume Trend</h3>
        <select className="text-xs border-border bg-card text-foreground rounded-md shadow-sm focus:border-primary/50 focus:ring focus:ring-primary/20 focus:ring-opacity-50">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      
      <LineChart 
        data={data}
        xKey="date"
        series={[
          // FIX: Use 'count' key instead of 'total'
          { key: "count", name: "Received", color: "var(--primary)" },
          { key: "resolved", name: "Resolved", color: "var(--success-green)" }
        ]}
        height={300}
      />
    </div>
  );
}