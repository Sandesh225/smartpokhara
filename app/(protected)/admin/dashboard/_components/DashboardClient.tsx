"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { AdminDashboardData } from "@/lib/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsOverview } from "./MetricsOverview";
import { DepartmentWorkload } from "./DepartmentWorkload";
import { TasksOverview } from "./TasksOverview";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { ComplaintStatusChart } from "./ComplaintStatusChart";
import { PaymentCollectionStats } from "./PaymentCollectionStats";
import { TrendGraph } from "./TrendGraph";
import { WardHeatmap } from "./WardHeatmap";
import { WebsiteAnalytics } from "./WebsiteAnalytics";
import { 
  Loader2, TrendingUp, PieChart, RefreshCcw, Activity, 
  ShieldCheck, BarChart3, Clock, AlertCircle 
} from "lucide-react";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart as RechartsPie, Pie, Cell, Legend,
} from "recharts";

const COLORS = {
  primary: "rgb(var(--primary))",
  secondary: "rgb(var(--secondary))",
  success: "rgb(var(--success-green))",
  warning: "rgb(var(--warning-amber))",
  muted: "rgb(var(--neutral-stone-300))",
};

export function DashboardClient({ initialData }: { initialData: AdminDashboardData }) {
  const { data, loading, refresh } = useAdminDashboard(initialData);
  const [trendRange, setTrendRange] = useState<"day" | "week" | "month">("week");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!data) return { trends: [], status: [] };
    
    return {
      trends: data.trends.map((t) => ({
        name: new Date(t.date).toLocaleDateString(undefined, { weekday: "short" }),
        count: t.count,
      })),
      status: data.statusDist.map((s) => ({
        name: s.status.replace("_", " ").toUpperCase(),
        value: s.count,
      })),
    };
  }, [data]);

  if (!isMounted || loading || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin text-primary" />
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary/60" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg md:text-xl font-bold tracking-tight text-foreground">
            Synchronizing Command Center
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
              Pokhara Node 01
            </Badge>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">
              Encrypted Uplink Active
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 pb-8 md:pb-12 px-2 sm:px-4 lg:px-6 animate-in fade-in duration-700">
      {/* RESPONSIVE HEADER */}
      <header className="flex flex-col gap-4 md:gap-6 border-b border-border pb-4 pt-4 px-2 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tighter">
                Command Center
              </h1>
            </div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>Metropolitan Governance & Analytics</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-green"></span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 self-start sm:self-auto">
            <div className="hidden lg:flex flex-col items-end mr-2 md:mr-4">
              <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                System Status
              </span>
              <span className="text-[10px] md:text-xs font-bold text-success-green uppercase">
                Optimal
              </span>
            </div>
            <button
              onClick={() => refresh()}
              className="h-9 md:h-11 px-3 md:px-5 flex items-center gap-2 text-[10px] md:text-xs font-bold bg-card hover:bg-accent transition-all rounded-xl border border-border shadow-sm active:scale-95"
            >
              <RefreshCcw className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden sm:inline">REFRESH</span>
            </button>
          </div>
        </div>
      </header>

      {/* METRICS OVERVIEW */}
      <MetricsOverview metrics={data.metrics} />

      {/* TABS NAVIGATION */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl md:rounded-2xl border border-border mb-4 md:mb-8 w-full overflow-x-auto flex justify-start scrollbar-hide">
          {["overview", "analytics", "operations"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-lg md:rounded-xl px-4 md:px-8 py-2 font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              {/* TREND CHART */}
              <Card className="stone-card overflow-hidden border border-border">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-muted/30 space-y-2 sm:space-y-0 p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-foreground">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span>Inflow Velocity</span>
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] md:text-[10px] bg-background self-start sm:self-auto"
                  >
                    7 DAY CYCLE
                  </Badge>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[300px] md:h-[350px] pt-4 md:pt-8 px-2 sm:px-4 md:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.trends}>
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={COLORS.primary}
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor={COLORS.primary}
                            stopOpacity={0.6}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "rgb(var(--muted-foreground))",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "rgb(var(--muted-foreground))",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                        width={30}
                      />
                      <Tooltip
                        cursor={{ fill: "rgb(var(--accent))", opacity: 0.3 }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid rgb(var(--border))",
                          backgroundColor: "rgb(var(--card))",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* DEPARTMENT WORKLOAD */}
              <DepartmentWorkload data={data.deptWorkload} />
            </div>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 space-y-4 md:space-y-6">
              {/* QUICK ACTIONS */}
              <QuickActionsPanel />

              {/* STATUS PIE CHART */}
              <Card className="stone-card border border-border">
                <CardHeader className="bg-muted/30 p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-foreground">
                    <PieChart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span>Status Mix</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[280px] md:h-[300px] pt-4 px-2 sm:px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={chartData.status}
                        innerRadius="55%"
                        outerRadius="75%"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.status.map((_, i) => (
                          <Cell
                            key={i}
                            fill={
                              i === 0
                                ? COLORS.primary
                                : i === 1
                                  ? COLORS.success
                                  : i === 2
                                    ? COLORS.warning
                                    : COLORS.muted
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid rgb(var(--border))",
                          backgroundColor: "rgb(var(--card))",
                          fontSize: "11px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "10px",
                          fontWeight: "600",
                          paddingTop: "16px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* TASKS OVERVIEW */}
              <TasksOverview tasks={data.recentTasks} />
            </aside>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4 md:space-y-6">
          <TrendGraph
            data={data.trends}
            range={trendRange}
            onRangeChange={setTrendRange}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <ComplaintStatusChart data={data.statusDist} />
            <PaymentCollectionStats data={data.paymentStats || []} />
          </div>
          <WardHeatmap data={data.wardStats || []} />
          <WebsiteAnalytics data={data.websiteMetrics || []} />
        </TabsContent>

        {/* OPERATIONS TAB */}
        <TabsContent value="operations" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              <QuickActionsPanel />
              <Card className="stone-card border border-border">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Infrastructure Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 md:p-6 pt-0">
                  <div className="flex justify-between items-center p-3 md:p-4 bg-success-green/10 rounded-xl border border-success-green/20">
                    <span className="text-xs md:text-sm font-bold text-success-green">
                      API Gateway
                    </span>
                    <Badge className="bg-success-green text-[8px] md:text-[9px] px-2 py-0.5">
                      OPERATIONAL
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 md:p-4 bg-info-blue/10 rounded-xl border border-info-blue/20">
                    <span className="text-xs md:text-sm font-bold text-info-blue">
                      DB Cluster
                    </span>
                    <Badge className="bg-info-blue text-[8px] md:text-[9px] px-2 py-0.5">
                      SYNCED
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <TasksOverview tasks={data.recentTasks} />
              <DepartmentWorkload data={data.deptWorkload} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}