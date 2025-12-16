"use client";

import { BarChart } from "@/components/supervisor/shared/charts/BarChart";

interface StaffMetric {
  name: string;
  totalResolved: number;
  slaCompliance: number;
}

interface Props {
  data: StaffMetric[];
}

export function StaffPerformanceComparison({ data }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-6">Staff Performance (Resolution Volume)</h3>
      <BarChart 
        data={data}
        xKey="name"
        series={[{ key: "totalResolved", name: "Resolved", color: "#6366f1" }]}
        height={300}
      />
    </div>
  );
}