
// ========================================

// TrendGraph.tsx - Enhanced
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendDataPoint } from "@/types/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

interface TrendGraphProps {
  data: TrendDataPoint[];
  range: string;
  onRangeChange: (val: 'day'|'week'|'month') => void;
}

export function TrendGraph({ data, range, onRangeChange }: TrendGraphProps) {
  const chartData = data.map(d => ({
    date: format(new Date(d.date), range === 'day' ? 'HH:mm' : 'MMM dd'),
    count: d.count
  }));

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          Complaint Trends
        </CardTitle>
        <Select value={range} onValueChange={(v: any) => onRangeChange(v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs font-medium border-gray-200 hover:border-gray-300 transition-colors">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[320px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                fontSize={11} 
                stroke="#9ca3af" 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                fontSize={11} 
                stroke="#9ca3af" 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `${v}`}
                dx={-5}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '10px 14px',
                  fontSize: '12px'
                }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No trend data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
