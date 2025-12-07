"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DepartmentWorkloadProps {
  departments: any[];
}

export default function DepartmentWorkloadChart({ departments }: DepartmentWorkloadProps) {
  // Transform raw data into chart-friendly format
  const chartData = useMemo(() => {
    return departments.map((dept) => {
      const active = dept.complaints.filter(
        (c: any) => !["resolved", "closed", "rejected"].includes(c.status)
      ).length;

      const overdue = dept.complaints.filter(
        (c: any) =>
          !["resolved", "closed", "rejected"].includes(c.status) &&
          new Date(c.sla_due_at) < new Date()
      ).length;

      // Active includes overdue in the raw count, so we subtract for visual stacking
      const onTrack = Math.max(0, active - overdue);

      return {
        name: dept.name,
        onTrack,
        overdue,
        total: active,
      };
    }).sort((a, b) => b.total - a.total).slice(0, 8); // Top 8 busy departments
  }, [departments]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-gray-400">
        No department data available
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120} 
            tick={{ fontSize: 11, fill: "#374151" }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: "#F3F4F6" }}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
          />
          <Legend />
          <Bar 
            dataKey="onTrack" 
            name="On Track" 
            stackId="a" 
            fill="#3B82F6" 
            radius={[0, 0, 0, 0]} 
            barSize={20}
          />
          <Bar 
            dataKey="overdue" 
            name="Overdue" 
            stackId="a" 
            fill="#EF4444" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}