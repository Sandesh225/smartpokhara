"use client";

import { BarChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/_charts/BarChart";

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
    <div className="bg-card p-6 rounded-xl border border-border shadow-xs">
      <h3 className="text-base font-bold text-foreground mb-6">Staff Performance (Resolution Volume)</h3>
      <BarChart 
        data={data}
        xKey="name"
        series={[{ key: "totalResolved", name: "Resolved", color: "var(--primary)" }]}
        height={300}
      />
    </div>
  );
}