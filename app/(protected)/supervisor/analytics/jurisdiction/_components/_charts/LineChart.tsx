"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface LineChartProps {
  data: any[];
  xKey: string;
  series: {
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div
              className="w-2 h-2 rounded-full"
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

export function LineChart({
  data,
  xKey,
  series,
  height = 300,
  className,
  showGrid = true,
  showLegend = true,
}: LineChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#E5E7EB" 
            />
          )}
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
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: "#9CA3AF", strokeWidth: 1, strokeDasharray: "4 4" }} 
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-gray-600 font-medium ml-1">
                  {value}
                </span>
              )}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ 
                r: 6, 
                strokeWidth: 0,
                className: "transition-all duration-200"
              }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}