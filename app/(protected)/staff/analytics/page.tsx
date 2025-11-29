// app/(protected)/staff/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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
    const supabase = createClient();
    
    try {
      // Calculate date range
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

      // Get complaints data
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

      // Calculate metrics
      const total = complaints?.length || 0;
      const resolved = complaints?.filter(c => c.status === "resolved").length || 0;
      const pending = complaints?.filter(c => 
        ["submitted", "assigned", "in_progress"].includes(c.status)
      ).length || 0;
      
      const overdue = complaints?.filter(c => 
        c.sla_due_at && new Date(c.sla_due_at) < now && 
        !["resolved", "closed", "rejected"].includes(c.status)
      ).length || 0;

      // Calculate average resolution time
      const resolvedComplaints = complaints?.filter(c => c.resolved_at) || [];
      const totalResolutionTime = resolvedComplaints.reduce((acc, complaint) => {
        const submitted = new Date(complaint.submitted_at);
        const resolved = new Date(complaint.resolved_at!);
        return acc + (resolved.getTime() - submitted.getTime());
      }, 0);
      const avgResolutionDays = resolvedComplaints.length > 0 
        ? totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)
        : 0;

      // Calculate SLA compliance
      const slaCompliant = resolvedComplaints.filter(complaint => {
        if (!complaint.sla_due_at) return true;
        const resolved = new Date(complaint.resolved_at!);
        const slaDue = new Date(complaint.sla_due_at);
        return resolved <= slaDue;
      }).length;
      const slaCompliance = resolvedComplaints.length > 0 
        ? (slaCompliant / resolvedComplaints.length) * 100 
        : 0;

      // Complaints by category
      const categoryCounts = complaints?.reduce((acc, complaint) => {
        const category = complaint.complaint_categories?.name || "Unknown";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const complaintsByCategory = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Complaints by ward
      const wardCounts = complaints?.reduce((acc, complaint) => {
        const ward = complaint.wards?.name || "Unknown";
        acc[ward] = (acc[ward] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const complaintsByWard = Object.entries(wardCounts)
        .map(([ward, count]) => ({ ward, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Monthly trend
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="mt-2 text-sm text-gray-600">
              Performance metrics and complaint statistics.
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <MetricCard
          title="Total Complaints"
          value={analytics.totalComplaints}
          trend="total"
          color="blue"
        />
        <MetricCard
          title="Resolved"
          value={analytics.resolvedComplaints}
          trend="positive"
          subtitle={`${((analytics.resolvedComplaints / analytics.totalComplaints) * 100).toFixed(1)}% resolution rate`}
          color="green"
        />
        <MetricCard
          title="Overdue"
          value={analytics.overdueComplaints}
          trend="negative"
          subtitle="SLA breached"
          color="red"
        />
        <MetricCard
          title="Avg. Resolution"
          value={analytics.avgResolutionDays.toFixed(1)}
          trend="neutral"
          subtitle="Days"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Complaints by Category */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Complaints by Category</h3>
          <div className="space-y-3">
            {analytics.complaintsByCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / analytics.totalComplaints) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by Ward */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Complaints by Ward</h3>
          <div className="space-y-3">
            {analytics.complaintsByWard.map((item) => (
              <div key={item.ward} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.ward}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / analytics.totalComplaints) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h3>
        <div className="h-64">
          <div className="flex items-end justify-between h-48">
            {analytics.monthlyTrend.map((item, index) => (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div
                  className="w-8 bg-blue-500 rounded-t"
                  style={{
                    height: `${(item.count / Math.max(...analytics.monthlyTrend.map(m => m.count))) * 100}%`,
                  }}
                />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {item.month}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SLA Compliance</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {analytics.slaCompliance.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-2">
              of complaints resolved within SLA
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Complaints</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {analytics.pendingComplaints}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              awaiting resolution
            </div>
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
  trend,
  color 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  trend: "positive" | "negative" | "neutral" | "total";
  color: "blue" | "green" | "red" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const trendIcons = {
    positive: "↗",
    negative: "↘", 
    neutral: "→",
    total: ""
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <dt className="text-sm font-medium">{title}</dt>
        {trend !== "total" && (
          <span className="text-sm">{trendIcons[trend]}</span>
        )}
      </div>
      <dd className="mt-2 text-3xl font-semibold">{value}</dd>
      {subtitle && (
        <dd className="text-sm opacity-75">{subtitle}</dd>
      )}
    </div>
  );
}