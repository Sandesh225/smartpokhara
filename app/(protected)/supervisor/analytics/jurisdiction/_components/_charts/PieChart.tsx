"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface PieChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  colors: string[];
  height?: number;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.payload?.total || 0;
    const percentage = total > 0 ? ((data.value as number / total) * 100).toFixed(1) : 0;
    
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: data.payload.fill }}
            />
            <span className="font-semibold text-gray-900">{data.name}</span>
          </div>
          <div className="pl-4 space-y-0.5">
            <div className="text-gray-600">
              Count: <span className="font-medium text-gray-900">{data.value}</span>
            </div>
            <div className="text-gray-600">
              Percentage: <span className="font-medium text-gray-900">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Calculate total for percentage display
function enrichDataWithTotal(data: any[], dataKey: string) {
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
  return data.map(item => ({ ...item, total }));
}

export function PieChart({
  data,
  nameKey,
  dataKey,
  colors,
  height = 300,
  className,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
}: PieChartProps) {
  const enrichedData = enrichDataWithTotal(data, dataKey);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={enrichedData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {enrichedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                strokeWidth={0}
                className="transition-opacity hover:opacity-80 cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) => (
                <span className="text-xs text-gray-600 font-medium ml-1">
                  {value}
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}