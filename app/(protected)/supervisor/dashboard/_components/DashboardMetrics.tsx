"use client";

import {
  AlertCircle,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  Users,
  Clock,
  BarChart3,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * METRICS CARDS
 * Styled with "Machhapuchhre Modern" elevations.
 */
export function DashboardMetrics({ metrics }: { metrics: any }) {
  const compliance = metrics.slaComplianceRate ?? 100;

  const cards = [
    {
      label: "Active Complaints",
      value: metrics.activeCount,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/supervisor/complaints?status=active",
      subtitle: "Total workload",
    },
    {
      label: "Unassigned Queue",
      value: metrics.unassignedCount,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      href: "/supervisor/complaints/unassigned",
      alert: metrics.unassignedCount > 0,
      subtitle: "Pending allocation",
    },
    {
      label: "SLA Compliance",
      value: `${compliance}%`,
      icon: compliance >= 80 ? CheckCircle2 : AlertCircle,
      color: compliance >= 80 ? "text-success" : "text-destructive",
      bg: compliance >= 80 ? "bg-success/10" : "bg-destructive/10",
      href: "/supervisor/analytics?view=sla",
      subtitle: compliance >= 80 ? "Above target" : "Below target",
    },
    {
      label: "Resolved Today",
      value: metrics.resolvedTodayCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/supervisor/complaints?status=resolved&period=today",
      subtitle: "Daily throughput",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className="group h-full">
          <div className="stone-card p-6 h-full relative overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
                  {card.label}
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-black text-foreground">
                    {card.value}
                  </h3>
                  {card.alert && (
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {card.subtitle}
                </p>
              </div>
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6",
                  card.bg,
                  card.color
                )}
              >
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Link>
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
      gradient: "from-blue-500/20 to-primary/20",
    },
    {
      label: "Review Overdue",
      icon: Clock,
      href: "/supervisor/complaints/overdue",
      badge: counts.overdue,
      gradient: "from-destructive/20 to-red-600/20",
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      href: "/supervisor/analytics",
      gradient: "from-purple-500/20 to-indigo-600/20",
    },
    {
      label: "Team Calendar",
      icon: Calendar,
      href: "/supervisor/calendar",
      gradient: "from-emerald-500/20 to-success/20",
    },
  ];

  return (
    <div className="stone-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">
          Operational Shortcuts
        </h3>
        <button className="text-xs font-bold text-primary flex items-center gap-1 group">
          View All{" "}
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group relative stone-card p-4 border-border/40 hover:border-primary/50 transition-all bg-linear-to-br from-transparent to-muted/10"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center bg-linear-to-br transition-transform group-hover:scale-110",
                  action.gradient
                )}
              >
                <action.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </h4>
              </div>
              {action.badge > 0 && (
                <span className="h-5 min-w-[1.25rem] px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center shadow-lg">
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