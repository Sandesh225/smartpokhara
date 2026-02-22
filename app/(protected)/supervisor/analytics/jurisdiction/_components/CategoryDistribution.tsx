"use client";

import { PieChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/_charts/PieChart";

interface Props {
  data: { name: string; value: number; fill?: string }[];
}

export function CategoryDistribution({ data }: Props) {
  const COLORS = ["var(--primary)", "var(--warning-amber)", "var(--success-green)", "var(--secondary)", "var(--destructive)"];

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-xs">
      <h3 className="text-base font-bold text-foreground mb-2">Category Breakdown</h3>
      <PieChart 
        data={data}
        nameKey="name"
        dataKey="value"
        colors={COLORS}
        height={300}
      />
    </div>
  );
}