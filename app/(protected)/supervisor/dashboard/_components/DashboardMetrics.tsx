"use client";

import { AlertCircle, CheckCircle2, Briefcase, ArrowRight, Users, Clock, BarChart3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UniversalStatCard } from "@/components/shared/UniversalStatCard";

export function DashboardMetrics({ metrics }: { metrics: any }) {
  // Safely map snake_case (from DB) OR camelCase (from API)
  const activeCount = metrics?.active_complaints ?? metrics?.activeCount ?? 0;
  const unassignedCount = metrics?.unassigned_complaints ?? metrics?.unassignedCount ?? 0;
  const resolvedTodayCount = metrics?.resolved_today ?? metrics?.resolvedTodayCount ?? 0;
  const overdueCount = metrics?.overdue_complaints ?? metrics?.overdueCount ?? 0;
  const slaComplianceRate = metrics?.sla_compliance_rate ?? metrics?.slaComplianceRate ?? null;

  // Dynamically calculate compliance if not provided by the API
  const totalForSla = activeCount + resolvedTodayCount + overdueCount;
  const compliance = slaComplianceRate ?? 
    (totalForSla > 0 ? Math.round(((totalForSla - overdueCount) / totalForSla) * 100) : 100);

  const cards = [
    {
      label: "Active Complaints",
      value: activeCount,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      href: "/supervisor/complaints?status=active",
      subtitle: "Total workload",
    },
    {
      label: "Unassigned Queue",
      value: unassignedCount,
      icon: AlertCircle,
      color: "text-warning-amber",
      bg: "bg-warning-amber/10 border-warning-amber/20",
      href: "/supervisor/complaints/unassigned",
      subtitle: "Pending allocation",
    },
    {
      label: "SLA Compliance",
      value: `${compliance}%`,
      icon: compliance >= 80 ? CheckCircle2 : AlertCircle,
      color: compliance >= 80 ? "text-success-green" : "text-destructive",
      bg: compliance >= 80 ? "bg-success-green/10 border-success-green/20" : "bg-destructive/10 border-destructive/20",
      href: "/supervisor/analytics?view=sla",
      subtitle: compliance >= 80 ? "Above target" : "Below target",
    },
    {
      label: "Resolved Today",
      value: resolvedTodayCount,
      icon: CheckCircle2,
      color: "text-info-blue",
      bg: "bg-info-blue/10 border-info-blue/20",
      href: "/supervisor/complaints?status=resolved&period=today",
      subtitle: "Daily throughput",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <UniversalStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bg={card.bg}
            subtitle={card.subtitle}
            href={card.href}
            variant="default"
        />
      ))}
    </div>
  );
}

/**
 * QUICK ACTIONS BAR
 * High-performance links with "Machhapuchhre" gradients.
 */
export function QuickActions({ counts }: { counts: any }) {
  const actions = [
    {
      label: "Assign Staff",
      icon: Users,
      href: "/supervisor/complaints/unassigned",
      badge: counts.unassigned,
      bg: "bg-info-blue/10",
      color: "text-info-blue",
    },
    {
      label: "Review Overdue",
      icon: Clock,
      href: "/supervisor/complaints/overdue",
      badge: counts.overdue,
      bg: "bg-destructive/10",
      color: "text-destructive",
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      href: "/supervisor/analytics",
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      label: "Team Calendar",
      icon: Calendar,
      href: "/supervisor/calendar",
      bg: "bg-success-green/10",
      color: "text-success-green",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs p-5 md:p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <h3 className="text-base md:text-lg font-bold text-foreground tracking-tight">
          Operational Shortcuts
        </h3>
        <button className="text-xs font-bold text-primary flex items-center gap-1 group hover:text-primary/80 transition-colors">
          View All{" "}
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group relative bg-background border border-border hover:border-primary/50 hover:bg-muted/30 rounded-lg p-3 md:p-4 transition-all duration-200 block"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
                  action.bg
                )}
              >
                <action.icon className={cn("h-5 w-5", action.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {action.label}
                </h4>
              </div>
              {action.badge > 0 && (
                <span className="h-5 min-w-[1.25rem] px-1 rounded-full bg-destructive text-xs font-bold text-white flex items-center justify-center shadow-lg">
                  {action.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}