"use client";

import { AdminDashboardMetrics } from "@/features/admin-dashboard/types";
import {
  FileText,
  CheckCircle2,
  Coins,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UniversalStatCard } from "@/components/shared";

interface MetricsOverviewProps {
  metrics: AdminDashboardMetrics;
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const cards = [
    {
      label: "Total Complaints",
      value: metrics.totalComplaints,
      icon: FileText,
      trend: "+12.5%",
      trendUp: true,
      // Using CSS Variables from your Machhapuchhre Modern theme
      color: "text-primary",
      bg: "bg-primary/10",
      accent: "var(--primary-brand)",
    },
    {
      label: "Resolved Cases",
      value: metrics.resolvedComplaints,
      icon: CheckCircle2,
      trend: "+5.2%",
      trendUp: true,
      color: "text-secondary",
      bg: "bg-secondary/10",
      accent: "var(--accent-nature)",
    },
    {
      label: "Revenue Collected",
      value: `NPR ${metrics.revenue.toLocaleString()}`,
      icon: Coins,
      trend: "+8.1%",
      trendUp: true,
      color: "text-[rgb(var(--highlight-tech))]",
      bg: "bg-[rgb(var(--highlight-tech))]/10",
      accent: "var(--highlight-tech)",
    },
    {
      label: "System Health",
      value: `${metrics.activeTasks}%`, // Assuming health or activity %
      icon: Activity,
      trend: "-2.4%",
      trendUp: false,
      color: "text-[rgb(var(--error-red))]",
      bg: "bg-[rgb(var(--error-red))]/10",
      accent: "var(--error-red)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <UniversalStatCard
          key={idx}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bg={card.bg}
          trend={{
             value: card.trend,
             isPositive: card.trendUp,
          }}
          subtitle="Live system metric"
        />
      ))}
    </div>
  );
}
