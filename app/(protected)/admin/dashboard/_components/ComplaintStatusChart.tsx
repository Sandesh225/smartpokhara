import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusData } from "@/types/admin";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChart as PieChartIcon, Activity } from "lucide-react";

/**
 * Enhanced with Machhapuchhre Modern Design System
 * Uses CSS Variables for dynamic theme switching (Light/Dark)
 */
export function ComplaintStatusChart({
  data,
}: {
  data: ComplaintStatusData[];
}) {
  // Mapping the design system chart colors
  const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const chartData = data.map((d) => ({
    name: d.status.replace("_", " ").toUpperCase(),
    value: d.count,
  }));

  return (
    <Card className="stone-card  transition-all duration-300 hover:elevation-4 border-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-3 text-foreground">
            <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            Status Distribution
          </CardTitle>
          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase tracking-widest">
            Live Data
          </span>
        </div>
      </CardHeader>

      <CardContent className="h-[320px] pt-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Subtle gradients for the slices */}
                {CHART_COLORS.map((color, i) => (
                  <linearGradient
                    key={`grad-${i}`}
                    id={`grad-${i}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="transparent"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#grad-${index % CHART_COLORS.length})`}
                    className="hover:opacity-90 transition-all duration-300 cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-strong p-3 rounded-xl border border-white/20 elevation-3">
                        <p className="text-xs font-bold text-primary-brand mb-1">
                          {payload[0].name}
                        </p>
                        <p className="text-lg font-mono font-bold text-foreground">
                          {payload[0].value}{" "}
                          <span className="text-[10px] text-muted-foreground ml-1">
                            UNITS
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                    {value}
                  </span>
                )}
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <PieChartIcon className="w-16 h-16 text-muted/30" />
              <div className="absolute inset-0 animate-pulse bg-primary/5 rounded-full blur-xl" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground/70">
                No Status Data
              </p>
              <p className="text-xs text-muted-foreground max-w-[180px] mx-auto">
                Once complaints are logged, your Pokhara distribution view will
                activate.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}