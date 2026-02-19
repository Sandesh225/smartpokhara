"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendDataPoint } from "@/features/admin-dashboard/types";
import { TrendingUp, Calendar } from "lucide-react";

interface TrendGraphProps {
  data: any[];
  range: "day" | "week" | "month";
  onRangeChange: (range: "day" | "week" | "month") => void;
}

export function TrendGraph({ data, range, onRangeChange }: TrendGraphProps) {
  // Enhanced data formatting for Admin clarity
  const chartData = data.map((t) => ({
    name: new Date(t.date).toLocaleDateString(undefined, {
      weekday: range === "week" ? "short" : undefined,
      day: "numeric",
      month: range === "month" ? "short" : undefined,
    }),
    fullDate: new Date(t.date).toLocaleDateString(undefined, {
      dateStyle: "full",
    }),
    value: t.count,
  }));

  return (
    <Card className="stone-card border-none transition-all duration-300 hover:elevation-3">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            Analytics Velocity
          </CardTitle>
          <p className="text-xs font-medium text-muted-foreground ml-12">
            Monitoring reporting frequency across Pokhara
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Select value={range} onValueChange={(v: any) => onRangeChange(v)}>
            <SelectTrigger className="w-[130px] glass font-bold text-xs rounded-xl border-primary/10 h-9">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-border">
              <SelectItem value="day" className="text-xs font-bold">
                TODAY
              </SelectItem>
              <SelectItem value="week" className="text-xs font-bold">
                THIS WEEK
              </SelectItem>
              <SelectItem value="month" className="text-xs font-bold">
                THIS MONTH
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="h-[320px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Complex gradient for the "Morning Mist" depth effect */}
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(var(--primary-brand))"
                  stopOpacity={0.2}
                />
                <stop
                  offset="50%"
                  stopColor="rgb(var(--primary-brand))"
                  stopOpacity={0.05}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(var(--primary-brand))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="8 8"
              vertical={false}
              stroke="rgb(var(--neutral-stone-200))"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgb(var(--neutral-stone-500))",
                fontSize: 10,
                fontWeight: 700,
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgb(var(--neutral-stone-500))",
                fontSize: 10,
                fontWeight: 700,
              }}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-strong p-4 rounded-2xl border border-white/20 elevation-4 min-w-[140px]">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        {payload[0].payload.fullDate}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-primary">
                          {payload[0].value}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          Reports
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="rgb(var(--primary-brand))"
              strokeWidth={4}
              strokeLinecap="round"
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
