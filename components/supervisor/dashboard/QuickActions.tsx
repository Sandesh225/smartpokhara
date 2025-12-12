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
      gradient: "from-blue-500 to-blue-600",
      badge: counts.unassigned,
    },
    {
      label: "Review Overdue",
      description: "Check SLA breaches",
      href: "/supervisor/complaints/overdue",
      icon: Clock,
      gradient: "from-red-500 to-red-600",
      badge: counts.overdue,
    },
    {
      label: "View Analytics",
      description: "Performance insights",
      href: "/supervisor/analytics",
      icon: BarChart3,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      label: "Team Calendar",
      description: "Schedules & meetings",
      href: "/supervisor/calendar",
      icon: Calendar,
      gradient: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1 group">
          View all
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300",
                  action.gradient
                )}
              >
                <action.icon className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.label}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {action.description}
                </p>
              </div>

              {action.badge !== undefined && action.badge > 0 && (
                <span className="absolute top-3 right-3 h-6 min-w-[1.5rem] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {action.badge > 99 ? "99+" : action.badge}
                </span>
              )}
            </div>

            {/* Hover arrow indicator */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
