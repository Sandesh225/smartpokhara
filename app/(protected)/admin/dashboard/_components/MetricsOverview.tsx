"use client";

import { AdminDashboardData } from "@/types/admin";
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

interface MetricsOverviewProps {
  metrics: AdminDashboardData["metrics"];
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
        <div
          key={idx}
          className={cn(
            "stone-card group relative p-6 overflow-hidden transition-all duration-500 hover:elevation-5 border-none",
            "bg-linear-to-br from-card to-muted/20"
          )}
        >
          {/* Machhapuchhre Mist Gradient Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top right, rgb(${card.accent} / 0.08), transparent 70%)`,
            }}
          />

          <div className="flex justify-between items-start mb-6 relative z-10">
            {/* Icon with Lakeside Glass effect */}
            <div
              className={cn(
                "p-3 rounded-2xl glass-strong shadow-xs transition-transform group-hover:scale-110 duration-300",
                card.bg
              )}
            >
              <card.icon className={cn("w-6 h-6", card.color)} />
            </div>

            {/* Admin Trend Badge */}
            <div
              className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg font-mono border",
                card.trendUp
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-red-500/10 text-red-600 border-red-500/20"
              )}
            >
              {card.trendUp ? (
                <ArrowUpRight className="w-3 h-3 stroke-[3]" />
              ) : (
                <ArrowDownRight className="w-3 h-3 stroke-[3]" />
              )}
              {card.trend}
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {card.label}
              </h3>
              <div className="h-px flex-1 bg-border/50 group-hover:bg-primary/20 transition-colors" />
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground font-mono tracking-tighter tabular-nums">
                {card.value}
              </p>
              {card.trendUp && (
                <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            <p className="text-[10px] font-medium text-muted-foreground/60 flex items-center gap-1 italic">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Live system metric
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
