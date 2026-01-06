"use client";

import { LineChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/_charts/LineChart";

interface Props {
  data: { date: string; total: number; resolved: number }[];
}

export function ComplaintsTrendChart({ data }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-gray-900">Complaint Volume Trend</h3>
        <select className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      
      <LineChart 
        data={data}
        xKey="date"
        series={[
          { key: "total", name: "Received", color: "#3B82F6" },
          { key: "resolved", name: "Resolved", color: "#10B981" }
        ]}
        height={300}
      />
    </div>
  );
}