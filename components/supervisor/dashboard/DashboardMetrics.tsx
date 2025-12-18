"use client";

import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MetricsProps {
  metrics: {
    activeCount: number;
    unassignedCount: number;
    overdueCount: number;
    resolvedTodayCount: number;
    avgResolutionTimeHours: number;
    slaComplianceRate?: number;
    // TODO: Add trend data from backend
    // trends?: {
    //   activeCountTrend?: { value: number; direction: 'up' | 'down' | 'neutral' };
    //   unassignedCountTrend?: { value: number; direction: 'up' | 'down' | 'neutral' };
    //   complianceTrend?: { value: number; direction: 'up' | 'down' | 'neutral' };
    //   resolvedTodayTrend?: { value: number; direction: 'up' | 'down' | 'neutral' };
    // };
  };
}

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  href?: string;
  alert?: boolean;
  subtitle?: string;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  href,
  alert,
  subtitle,
}: MetricCardProps) {
  const content = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm h-full",
        "transition-all duration-300 group",
        href && "hover:shadow-xl hover:scale-[1.02] cursor-pointer",
        `bg-linear-to-br ${gradient}`
      )}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white" />
        <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-white" />
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {alert && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "h-14 w-14 rounded-xl flex items-center justify-center shadow-sm",
              "group-hover:scale-110 transition-transform duration-300",
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-7 w-7" />
          </div>
        </div>

        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

export function DashboardMetrics({ metrics }: MetricsProps) {
  const compliance = metrics.slaComplianceRate ?? 100;

  const cards: MetricCardProps[] = [
    {
      label: "Active Complaints",
      value: metrics.activeCount,
      icon: Briefcase,
      gradient: "from-blue-50 to-white",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/supervisor/complaints?status=active",
      subtitle: "Click to view all active complaints",
    },
    {
      label: "Unassigned Queue",
      value: metrics.unassignedCount,
      icon: AlertCircle,
      gradient: "from-orange-50 to-white",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      href: "/supervisor/complaints/unassigned",
      alert: metrics.unassignedCount > 0,
      subtitle: metrics.unassignedCount > 0 ? "Requires immediate attention" : "All complaints assigned",
    },
    {
      label: "SLA Compliance",
      value: `${compliance}%`,
      icon: compliance >= 80 ? CheckCircle2 : AlertCircle,
      gradient: compliance >= 80 ? "from-green-50 to-white" : "from-red-50 to-white",
      iconBg: compliance >= 80 ? "bg-green-100" : "bg-red-100",
      iconColor: compliance >= 80 ? "text-green-600" : "text-red-600",
      href: "/supervisor/analytics?view=sla",
      subtitle: compliance >= 80 ? "Meeting targets" : "Needs improvement",
    },
    {
      label: "Resolved Today",
      value: metrics.resolvedTodayCount,
      icon: CheckCircle2,
      gradient: "from-emerald-50 to-white",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/supervisor/complaints?status=resolved&period=today",
      subtitle: "Great progress today!",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}