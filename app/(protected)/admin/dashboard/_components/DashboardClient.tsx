"use client";

import { useState, useEffect } from "react";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { AdminDashboardData } from "@/lib/types/admin";
import { cn } from "@/lib/utils";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // FIXED: Added missing import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dashboard Custom Components
import { MetricsOverview } from "./MetricsOverview";
import { DepartmentWorkload } from "./DepartmentWorkload";
import { TasksOverview } from "./TasksOverview";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { ComplaintStatusChart } from "./ComplaintStatusChart";
import { PaymentCollectionStats } from "./PaymentCollectionStats";
import { TrendGraph } from "./TrendGraph";
import { WardHeatmap } from "./WardHeatmap";
import { WebsiteAnalytics } from "./WebsiteAnalytics";

// Icons
import {
  Loader2,
  TrendingUp,
  PieChart,
  RefreshCcw,
  Activity,
} from "lucide-react";

// Recharts
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#2B5F75", "#64B5D1", "#F59E0B", "#EF4444", "#8B5CF6"];

export function DashboardClient({
  initialData,
}: {
  initialData: AdminDashboardData;
}) {
  const { data, loading, refresh } = useAdminDashboard(initialData);
  const [trendRange, setTrendRange] = useState<"day" | "week" | "month">(
    "week"
  );
  const [isMounted, setIsMounted] = useState(false);

  // Handle Hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading || !data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <div className="text-center space-y-1">
          <p className="text-lg font-bold tracking-tight text-slate-900">
            Syncing Metropolitan Data
          </p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Connecting to Pokhara Central API
          </p>
        </div>
      </div>
    );
  }

  // Formatting Logic
  const trendData = data.trends.map((t) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { weekday: "short" }),
    count: t.count,
  }));

  const statusData = data.statusDist.map((s) => ({
    name: s.status.replace("_", " ").toUpperCase(),
    value: s.count,
  }));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Command Center
          </h1>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Metropolitan Governance & Real-time Analytics
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </p>
        </div>
        <button
          onClick={() => refresh()}
          className="h-10 px-4 flex items-center gap-2 text-xs font-bold bg-white hover:bg-slate-50 transition-all rounded-xl border border-slate-200 shadow-sm"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          REFRESH FEED
        </button>
      </header>

      {/* Primary KPI Ribbon */}
      <MetricsOverview metrics={data.metrics} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-8">
          <TabsTrigger
            value="overview"
            className="rounded-xl px-6 font-bold uppercase tracking-widest text-[10px]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-xl px-6 font-bold uppercase tracking-widest text-[10px]"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className="rounded-xl px-6 font-bold uppercase tracking-widest text-[10px]"
          >
            Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-sm stone-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Inflow Velocity
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] bg-slate-50"
                  >
                    7 DAY TREND
                  </Badge>
                </CardHeader>
                <CardContent className="h-[350px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.02)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#2B5F75"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <DepartmentWorkload data={data.deptWorkload} />
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <QuickActionsPanel />
              <Card className="border-none shadow-sm stone-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
                    <PieChart className="w-5 h-5 text-primary" />
                    Status Mix
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <TasksOverview tasks={data.recentTasks} />
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <TrendGraph
            data={data.trends}
            range={trendRange}
            onRangeChange={setTrendRange}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComplaintStatusChart data={data.statusDist} />
            <PaymentCollectionStats data={data.paymentStats || []} />
          </div>
          <WardHeatmap data={data.wardStats || []} />
          <WebsiteAnalytics data={data.websiteMetrics || []} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <QuickActionsPanel />
              <Card className="stone-card border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-xs font-bold text-green-700">
                      API Cluster
                    </span>
                    <span className="text-[10px] font-black text-green-700">
                      ONLINE
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
              <TasksOverview tasks={data.recentTasks} />
              <DepartmentWorkload data={data.deptWorkload} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}