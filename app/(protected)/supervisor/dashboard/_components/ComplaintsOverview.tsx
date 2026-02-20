"use client";

import { useTheme } from "next-themes";
import { PieChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/_charts/PieChart";
import { BarChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/_charts/BarChart";
import { LineChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/_charts/LineChart";
import { TrendingUp, PieChartIcon, BarChart3, InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewProps {
  statusData: any[];
  categoryData: any[];
  trendData: any[];
}

/**
 * Enhanced Empty State with Theme Awareness
 */
function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: any;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/50 mb-4 border border-border/50 shadow-sm">
        <Icon className="w-7 h-7 text-muted-foreground/60" />
      </div>
      <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
        {message}
      </p>
    </div>
  );
}

export function ComplaintsOverview({
  statusData,
  categoryData,
  trendData,
}: OverviewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasStatusData = statusData && statusData.length > 0;
  const hasTrendData = trendData && trendData.length > 0;

  // Chart colors that harmonize with Machhapuchhre Modern
  const colors = {
    primary: isDark ? "#5EB4D2" : "#2B5F75", // Electric Blue vs Deep Navy
    success: "#10B981",
    warning: "#F59E0B",
    muted: isDark ? "#374151" : "#E5E7EB",
    grid: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Volume Trend Chart - Spans 2 columns */}
      <div className="lg:col-span-2 stone-card group overflow-hidden">
        {/* Header with Glass Gradient */}
        <div className="px-6 py-4 border-b border-border/50 bg-linear-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Volume Trend
                </h3>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Historical Analysis
                </p>
              </div>
            </div>

            <select className="text-xs font-semibold border border-border bg-card text-foreground rounded-lg px-3 py-2 hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {hasTrendData ? (
            <LineChart
              data={trendData}
              xKey="date"
              series={[
                { key: "count", name: "Complaints", color: colors.primary },
              ]}
              height={280}
              gridColor={colors.grid}
            />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="Awaiting Data Points"
              message="Trend visualizations will populate once daily reports are logged."
            />
          )}
        </div>
      </div>

      {/* 2. Status Distribution - 1 column */}
      <div className="stone-card group overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-linear-to-r from-secondary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner">
              <PieChartIcon className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground group-hover:text-secondary transition-colors">
                Resolution Status
              </h3>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Departmental Health
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {hasStatusData ? (
            <PieChart
              data={statusData}
              dataKey="value"
              nameKey="name"
              colors={[
                colors.primary,
                colors.warning,
                colors.success,
                colors.muted,
              ]}
              height={280}
            />
          ) : (
            <EmptyState
              icon={PieChartIcon}
              title="No Breakdown Available"
              message="Status metrics require at least one active complaint record."
            />
          )}
        </div>
      </div>
    </div>
  );
}