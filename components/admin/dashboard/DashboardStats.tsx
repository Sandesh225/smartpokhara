"use client";

import { BarChart3, AlertCircle, CheckCircle, Clock, AlertTriangle, Timer, DollarSign, Eye, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardStats } from "@/lib/types/admin";

interface DashboardStatsProps {
  stats: DashboardStats;
  paymentStats?: {
    today_revenue: number;
    week_revenue: number;
    month_revenue: number;
    pending_bills: number;
  };
  websiteStats?: {
    page_views_today: number;
    active_notices: number;
    total_visits_month: number;
  };
}

export function DashboardStats({
  stats,
  paymentStats,
  websiteStats,
}: DashboardStatsProps) {
  const { avg_resolution_days = 0 } = stats;

  const statCards = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: BarChart3,
      color: "info",
      change: "+12% from last month",
      changeType: "positive" as const,
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "warning",
      subtitle: `Awaiting assignment`,
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: Timer,
      color: "info",
      subtitle: `Being worked on`,
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "success",
      subtitle: `Avg: ${avg_resolution_days.toFixed(1)} days`,
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      color: "danger",
      subtitle: stats.overdue > 0 ? "Needs immediate attention" : "All on track",
    },
    {
      label: "Escalated",
      value: stats.escalated,
      icon: AlertTriangle,
      color: "warning",
      subtitle: "Require intervention",
    },
  ];

  // Payment stats
  if (paymentStats) {
    statCards.push(
      {
        label: "Revenue Today",
        value: `₹${(paymentStats.today_revenue / 1000).toFixed(1)}K`,
        icon: DollarSign,
        color: "success",
        change: "+8% from yesterday",
        changeType: "positive" as const,
      },
      {
        label: "Pending Bills",
        value: paymentStats.pending_bills,
        icon: FileText,
        color: "warning",
        subtitle: "Awaiting payment",
      }
    );
  }

  // Website stats
  if (websiteStats) {
    statCards.push(
      {
        label: "Page Views Today",
        value: websiteStats.page_views_today,
        icon: Eye,
        color: "info",
        change: `${websiteStats.total_visits_month} this month`,
        changeType: "neutral" as const,
      },
      {
        label: "Active Notices",
        value: websiteStats.active_notices,
        icon: FileText,
        color: "info",
        subtitle: "Published",
      }
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {statCards.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: typeof BarChart3;
  color: "success" | "warning" | "danger" | "info";
  subtitle?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
  change,
  changeType,
}: StatCardProps) {
  const colorClasses = {
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value.toLocaleString()}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
      {change && (
        <div
          className={`stat-card-change ${
            changeType === "positive"
              ? "positive"
              : changeType === "negative"
              ? "negative"
              : ""
          }`}
        >
          {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
          {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}