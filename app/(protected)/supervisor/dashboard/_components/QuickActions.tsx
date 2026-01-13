"use client";

import Link from "next/link";
import { Users, Clock, BarChart3, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  counts: {
    unassigned: number;
    overdue: number;
  };
}

export function QuickActions({ counts }: QuickActionsProps) {
  const actions = [
    {
      label: "Assign Staff",
      description: "Review unassigned queue",
      href: "/supervisor/complaints/unassigned",
      icon: Users,
      // Using opacity-based gradients to work across themes
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-500",
      badge: counts.unassigned,
    },
    {
      label: "Review Overdue",
      description: "Check SLA breaches",
      href: "/supervisor/complaints/overdue",
      icon: Clock,
      gradient: "from-destructive/20 to-red-600/20",
      iconColor: "text-destructive",
      badge: counts.overdue,
    },
    {
      label: "View Analytics",
      description: "Performance insights",
      href: "/supervisor/analytics",
      icon: BarChart3,
      gradient: "from-purple-500/20 to-indigo-600/20",
      iconColor: "text-purple-500",
    },
    {
      label: "Team Calendar",
      description: "Schedules & meetings",
      href: "/supervisor/calendar",
      icon: Calendar,
      gradient: "from-emerald-500/20 to-success/20",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="stone-card p-6 shadow-md border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Operational Shortcuts</p>
        </div>
        <button className="text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1 group">
          View all 
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/40 p-4 shadow-sm transition-all duration-300",
              "bg-card/50 hover:bg-card hover:shadow-lg hover:border-primary/30",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          >
            {/* Background Accent Glow */}
            <div className={cn(
              "absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
              action.gradient
            )} />

            <div className="relative flex items-start gap-4 z-10">
              <div
                className={cn(
                  "h-12 w-12 rounded-lg flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                  "bg-muted/50 border border-border/20",
                  action.iconColor
                )}
              >
                <action.icon className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {action.description}
                </p>
              </div>

              {action.badge !== undefined && action.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-destructive text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-in fade-in zoom-in duration-300">
                  {action.badge > 99 ? "99+" : action.badge}
                </span>
              )}
            </div>

            {/* Micro-interaction Arrow */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-40 transition-all transform translate-x-2 group-hover:translate-x-0">
              <ArrowRight className="h-3 w-3 text-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}