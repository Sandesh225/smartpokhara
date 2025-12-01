"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { ComplaintStatus } from "@/lib/types/complaints";

interface DashboardStatusRow {
  status: ComplaintStatus;
}

interface CitizenDashboardStatsProps {
  complaints: DashboardStatusRow[];
}

export function CitizenDashboardStats({
  complaints,
}: CitizenDashboardStatsProps) {
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) =>
      ["submitted", "received", "assigned"].includes(c.status)
    ).length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) =>
      ["resolved", "closed"].includes(c.status)
    ).length,
  };

  // Calculate percentages for visual indicators
  const resolvedPercentage =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const pendingPercentage =
    stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Complaints"
        value={stats.total}
        icon={<FileText className="w-6 h-6" />}
        gradient="from-blue-500 to-cyan-500"
        description="All time submissions"
        trend={{ value: 0, isPositive: true }}
      />

      <StatCard
        title="Pending Review"
        value={stats.pending}
        icon={<AlertCircle className="w-6 h-6" />}
        gradient="from-amber-500 to-orange-500"
        description={`${pendingPercentage}% of total`}
        trend={{ value: pendingPercentage, isPositive: false }}
        showProgress
        progress={pendingPercentage}
      />

      <StatCard
        title="In Progress"
        value={stats.inProgress}
        icon={<Clock className="w-6 h-6" />}
        gradient="from-purple-500 to-pink-500"
        description="Being worked on"
        showPulse
      />

      <StatCard
        title="Resolved"
        value={stats.resolved}
        icon={<CheckCircle className="w-6 h-6" />}
        gradient="from-green-500 to-emerald-500"
        description={`${resolvedPercentage}% success rate`}
        trend={{ value: resolvedPercentage, isPositive: true }}
        showProgress
        progress={resolvedPercentage}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  trend?: { value: number; isPositive: boolean };
  showProgress?: boolean;
  progress?: number;
  showPulse?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  description,
  trend,
  showProgress,
  progress = 0,
  showPulse,
}: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-white/40 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>

      {/* Decorative corner element */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}
      ></div>

      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-slate-600 flex items-center justify-between">
          <span>{title}</span>
          {trend && (
            <span
              className={`flex items-center gap-1 text-xs ${trend.isPositive ? "text-green-600" : "text-orange-600"}`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {trend.value}%
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="flex items-end justify-between mb-3">
          <div className="space-y-1">
            <div
              className={`text-4xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent animate-fade-in`}
            >
              {value}
            </div>
            <p className="text-xs text-slate-500 font-medium">{description}</p>
          </div>
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${showPulse ? "animate-pulse-scale" : ""}`}
          >
            {icon}
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${progress}%` }}
              >
                <div className="h-full w-full animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/40 transition-colors duration-300 pointer-events-none"></div>
    </Card>
  );
}