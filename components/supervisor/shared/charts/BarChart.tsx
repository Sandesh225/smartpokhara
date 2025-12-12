"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: any[];
  xKey: string;
  series: {
    key: string;
    name: string;
    color: string;
    stackId?: string;
  }[];
  height?: number;
  className?: string;
  layout?: "vertical" | "horizontal";
  showGrid?: boolean;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function BarChart({
  data,
  xKey,
  series,
  height = 300,
  className,
  layout = "horizontal",
  showGrid = true,
}: BarChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          layout={layout}
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={layout === "horizontal"}
              vertical={layout === "vertical"}
              stroke="#E5E7EB"
            />
          )}
          {layout === "horizontal" ? (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                dx={-10}
                tickFormatter={(value) => value.toLocaleString()}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-gray-600 font-medium ml-1">
                {value}
              </span>
            )}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              stackId={s.stackId}
              radius={s.stackId ? [0, 0, 0, 0] : layout === 'horizontal' ? [4, 4, 0, 0] : [0, 4, 4, 0]}
              barSize={32}
              className="transition-opacity hover:opacity-80 cursor-pointer"
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}