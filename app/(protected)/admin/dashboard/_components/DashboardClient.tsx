// DashboardClient.tsx - COMPLETE INTEGRATED VERSION WITH ALL COMPONENTS
"use client";

import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { AdminDashboardData } from "@/lib/types/admin";
import { MetricsOverview } from "./MetricsOverview";
import { DepartmentWorkload } from "./DepartmentWorkload";
import { TasksOverview } from "./TasksOverview";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { ComplaintStatusChart } from "./ComplaintStatusChart";
import { PaymentCollectionStats } from "./PaymentCollectionStats";
import { TrendGraph } from "./TrendGraph";
import { WardHeatmap } from "./WardHeatmap";
import { WebsiteAnalytics } from "./WebsiteAnalytics";
import { Loader2, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, 
  PieChart as RechartsPie, Pie, Cell, Legend 
} from "recharts";
import { useState } from "react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DashboardClient({ initialData }: { initialData: AdminDashboardData }) {
  const { data, loading } = useAdminDashboard(initialData);
  const [trendRange, setTrendRange] = useState<'day'|'week'|'month'>('week');

  if (loading || !data) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  // Format trends for chart
  const trendData = data.trends.map(t => ({
    name: new Date(t.date).toLocaleDateString(undefined, { weekday: 'short' }),
    count: t.count
  }));

  // Format status for pie
  const statusData = data.statusDist.map(s => ({
    name: s.status.replace('_', ' ').toUpperCase(),
    value: s.count
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Monitor system activity and key metrics in real-time</p>
      </div>

      {/* Metrics Overview - Always at top */}
      <MetricsOverview metrics={data.metrics} />
      
      {/* Tabbed Interface for Different Views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="text-sm font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm font-medium">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="operations" className="text-sm font-medium">
            Operations
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Charts Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Complaint Volume Bar Chart */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    Complaint Volume
                  </CardTitle>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    Last 7 Days
                  </span>
                </CardHeader>
                <CardContent className="h-[340px] w-full pt-2">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis 
                          dataKey="name" 
                          stroke="#9ca3af" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#9ca3af" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6', radius: 4 }}
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px 16px'
                          }}
                          labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#3b82f6" 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
               
              {/* Department Workload */}
              <DepartmentWorkload data={data.deptWorkload} />
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActionsPanel />
               
              {/* Status Distribution Chart */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <PieChart className="w-5 h-5 text-purple-600" />
                    </div>
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="45%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '10px 14px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <PieChart className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No status data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks Overview */}
              <TasksOverview tasks={data.recentTasks} />
            </div>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Graph with Range Selector */}
            <div className="lg:col-span-2">
              <TrendGraph 
                data={data.trends} 
                range={trendRange}
                onRangeChange={setTrendRange}
              />
            </div>

            {/* Complaint Status Chart */}
            <ComplaintStatusChart data={data.statusDist} />

            {/* Payment Collection Stats */}
            <PaymentCollectionStats data={data.paymentStats || []} />

            {/* Ward Heatmap */}
            <div className="lg:col-span-2">
              <WardHeatmap data={data.wardStats || []} />
            </div>

            {/* Website Analytics */}
            <div className="lg:col-span-2">
              <WebsiteAnalytics data={data.websiteMetrics || []} />
            </div>
          </div>
        </TabsContent>

        {/* OPERATIONS TAB */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Actions + Tasks */}
            <div className="space-y-6">
              <QuickActionsPanel />
              <TasksOverview tasks={data.recentTasks} />
            </div>

            {/* Middle Column - Department Workload + Payments */}
            <div className="space-y-6">
              <DepartmentWorkload data={data.deptWorkload} />
              <PaymentCollectionStats data={data.paymentStats || []} />
            </div>

            {/* Right Column - Status + Recent Activity */}
            <div className="space-y-6">
              <ComplaintStatusChart data={data.statusDist} />
              
              {/* Recent Activity Feed */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-50">
                      <BarChart3 className="w-5 h-5 text-amber-600" />
                    </div>
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm font-medium text-gray-700">API Status</span>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-gray-700">Database</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                      Healthy
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-700">Cache</span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}