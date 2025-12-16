"use client";

import { PieChart } from "@/components/supervisor/shared/charts/PieChart";

interface Props {
  data: { name: string; value: number; fill?: string }[];
}

export function CategoryDistribution({ data }: Props) {
  const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-2">Category Breakdown</h3>
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