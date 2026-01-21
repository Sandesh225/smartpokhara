// ═══════════════════════════════════════════════════════════
// app/(protected)/staff/analytics/page.tsx - ENHANCED ANALYTICS
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  overdueComplaints: number;
  avgResolutionDays: number;
  slaCompliance: number;
  complaintsByCategory: Array<{ category: string; count: number }>;
  complaintsByWard: Array<{ ward: string; count: number }>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export default function StaffAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    overdueComplaints: 0,
    avgResolutionDays: 0,
    slaCompliance: 0,
    complaintsByCategory: [],
    complaintsByWard: [],
    monthlyTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "1year">("30days");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    setLoading(true);
    const supabase = createClient();
    
    try {
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "7days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(now.getDate() - 90);
          break;
        case "1year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data: complaints, error } = await supabase
        .from("complaints")
        .select(`
          status,
          submitted_at,
          resolved_at,
          sla_due_at,
          complaint_categories(name),
          wards(ward_number, name)
        `)
        .gte("submitted_at", startDate.toISOString());

      if (error) throw error;

      const total = complaints?.length || 0;
      const resolved = complaints?.filter(c => c.status === "resolved").length || 0;
      const pending = complaints?.filter(c => 
        ["submitted", "assigned", "in_progress"].includes(c.status)
      ).length || 0;
      
      const overdue = complaints?.filter(c => 
        c.sla_due_at && new Date(c.sla_due_at) < now && 
        !["resolved", "closed", "rejected"].includes(c.status)
      ).length || 0;

      const resolvedComplaints = complaints?.filter(c => c.resolved_at) || [];
      const totalResolutionTime = resolvedComplaints.reduce((acc, complaint) => {
        const submitted = new Date(complaint.submitted_at);
        const resolved = new Date(complaint.resolved_at!);
        return acc + (resolved.getTime() - submitted.getTime());
      }, 0);
      const avgResolutionDays = resolvedComplaints.length > 0 
        ? totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)
        : 0;

      const slaCompliant = resolvedComplaints.filter(complaint => {
        if (!complaint.sla_due_at) return true;
        const resolved = new Date(complaint.resolved_at!);
        const slaDue = new Date(complaint.sla_due_at);
        return resolved <= slaDue;
      }).length;
      const slaCompliance = resolvedComplaints.length > 0 
        ? (slaCompliant / resolvedComplaints.length) * 100 
        : 0;

      const categoryCounts = complaints?.reduce((acc, complaint) => {
        const category = complaint.complaint_categories?.name || "Unknown";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const complaintsByCategory = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const wardCounts = complaints?.reduce((acc, complaint) => {
        const ward = `Ward ${complaint.wards?.ward_number || "Unknown"}`;
        acc[ward] = (acc[ward] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const complaintsByWard = Object.entries(wardCounts)
        .map(([ward, count]) => ({ ward, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const monthlyCounts = complaints?.reduce((acc, complaint) => {
        const month = new Date(complaint.submitted_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const monthlyTrend = Object.entries(monthlyCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setAnalytics({
        totalComplaints: total,
        resolvedComplaints: resolved,
        pendingComplaints: pending,
        overdueComplaints: overdue,
        avgResolutionDays,
        slaCompliance,
        complaintsByCategory,
        complaintsByWard,
        monthlyTrend,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  const getTimeRangeLabel = () => {
    const labels = {
      "7days": "Last 7 Days",
      "30days": "Last 30 Days",
      "90days": "Last 90 Days",
      "1year": "Last Year",
    };
    return labels[timeRange];
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
            Analytics Dashboard
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
              Analytics Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5">
              Performance metrics and complaint statistics
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="flex-1 sm:flex-none px-3 py-2 border-2 border-border rounded-lg bg-card font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadAnalytics} className="gap-2 font-bold">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title="Total Complaints"
          value={analytics.totalComplaints}
          icon={BarChart3}
          color="primary"
        />
        <MetricCard
          title="Resolved"
          value={analytics.resolvedComplaints}
          subtitle={`${analytics.totalComplaints > 0 ? ((analytics.resolvedComplaints / analytics.totalComplaints) * 100).toFixed(1) : 0}% resolution rate`}
          icon={CheckCircle2}
          color="success"
        />
        <MetricCard
          title="Overdue"
          value={analytics.overdueComplaints}
          subtitle="SLA breached"
          icon={AlertCircle}
          color="error"
        />
        <MetricCard
          title="Avg. Resolution"
          value={`${analytics.avgResolutionDays.toFixed(1)} days`}
          subtitle="Resolution time"
          icon={Clock}
          color="info"
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Category Chart */}
        <div className="stone-card overflow-hidden">
          <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-black text-base md:text-lg text-foreground">
                Complaints by Category
              </h3>
            </div>
          </div>
          <div className="p-4 md:p-6 space-y-3">
            {analytics.complaintsByCategory.length > 0 ? (
              analytics.complaintsByCategory.map((item) => {
                const percentage = analytics.totalComplaints > 0 
                  ? (item.count / analytics.totalComplaints) * 100 
                  : 0;
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground">{item.category}</span>
                      <span className="font-black text-primary">{item.count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/70 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground">No data available</div>
            )}
          </div>
        </div>

        {/* Ward Chart */}
        <div className="stone-card overflow-hidden">
          <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success-green/10">
                <Target className="w-5 h-5 text-success-green" />
              </div>
              <h3 className="font-black text-base md:text-lg text-foreground">
                Complaints by Ward
              </h3>
            </div>
          </div>
          <div className="p-4 md:p-6 space-y-3">
            {analytics.complaintsByWard.length > 0 ? (
              analytics.complaintsByWard.map((item) => {
                const percentage = analytics.totalComplaints > 0 
                  ? (item.count / analytics.totalComplaints) * 100 
                  : 0;
                return (
                  <div key={item.ward} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground">{item.ward}</span>
                      <span className="font-black text-success-green">{item.count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-success-green to-success-green/70 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* MONTHLY TREND */}
      <div className="stone-card overflow-hidden">
        <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info-blue/10">
                <TrendingUp className="w-5 h-5 text-info-blue" />
              </div>
              <h3 className="font-black text-base md:text-lg text-foreground">
                Monthly Trend
              </h3>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px] font-bold">
              {getTimeRangeLabel()}
            </Badge>
          </div>
        </div>
        <div className="p-4 md:p-6">
          {analytics.monthlyTrend.length > 0 ? (
            <div className="h-64 md:h-80">
              <div className="flex items-end justify-between h-full gap-2 md:gap-3">
                {analytics.monthlyTrend.map((item) => {
                  const maxCount = Math.max(...analytics.monthlyTrend.map(m => m.count));
                  const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={item.month} className="flex flex-col items-center flex-1 group">
                      <div className="relative w-full">
                        <div
                          className="w-full bg-gradient-to-t from-info-blue to-info-blue/70 rounded-t-lg transition-all duration-500 group-hover:from-primary group-hover:to-primary/70 min-h-[20px]"
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-foreground text-background px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                            {item.count}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-muted-foreground text-center font-medium">
                        {item.month.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* SLA Compliance */}
        <div className="stone-card overflow-hidden">
          <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success-green/10">
                <Target className="w-5 h-5 text-success-green" />
              </div>
              <h3 className="font-black text-base md:text-lg text-foreground">
                SLA Compliance
              </h3>
            </div>
          </div>
          <div className="p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-success-green/20 to-success-green/5 mb-4">
              <div className="text-4xl md:text-5xl font-black text-success-green">
                {analytics.slaCompliance.toFixed(1)}%
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              of complaints resolved within SLA
            </p>
          </div>
        </div>
        
        {/* Pending Complaints */}
        <div className="stone-card overflow-hidden">
          <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning-amber/10">
                <Clock className="w-5 h-5 text-warning-amber" />
              </div>
              <h3 className="font-black text-base md:text-lg text-foreground">
                Pending Complaints
              </h3>
            </div>
          </div>
          <div className="p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-warning-amber/20 to-warning-amber/5 mb-4">
              <div className="text-4xl md:text-5xl font-black text-warning-amber">
                {analytics.pendingComplaints}
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              awaiting resolution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  color 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: "primary" | "success" | "error" | "info";
}) {
  const colorClasses = {
    primary: "border-primary/30 bg-primary/5 text-primary",
    success: "border-success-green/30 bg-success-green/5 text-success-green",
    error: "border-error-red/30 bg-error-red/5 text-error-red",
    info: "border-info-blue/30 bg-info-blue/5 text-info-blue",
  };

  return (
    <div className="stone-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 overflow-hidden">
      <div className={cn("p-4 md:p-5 border-l-4", colorClasses[color])}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-lg", colorClasses[color].split(' ')[1])}>
            <Icon className={cn("w-5 h-5 md:w-6 md:h-6", colorClasses[color].split(' ')[2])} />
          </div>
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-black text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}