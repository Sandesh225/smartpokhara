"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  totalComplaints: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  onStatClick?: (status: string) => void;
}

export default function DashboardStats({
  totalComplaints,
  openCount,
  inProgressCount,
  resolvedCount,
  onStatClick,
}: DashboardStatsProps) {
  const stats = [
    {
      id: "all",
      label: "Total Complaints",
      value: totalComplaints,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      borderColor: "border-blue-200",
      accent: "group-hover:border-blue-400",
      shadowHover: "group-hover:shadow-blue-100",
      description: "All issues you have reported to the municipality.",
    },
    {
      id: "open",
      label: "Open",
      value: openCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      borderColor: "border-amber-200",
      accent: "group-hover:border-amber-400",
      shadowHover: "group-hover:shadow-amber-100",
      description: "Submitted but waiting for staff assignment.",
      warning: openCount > 5,
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: inProgressCount,
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      borderColor: "border-indigo-200",
      accent: "group-hover:border-indigo-400",
      shadowHover: "group-hover:shadow-indigo-100",
      description: "City staff are currently working on resolution.",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-200",
      accent: "group-hover:border-emerald-400",
      shadowHover: "group-hover:shadow-emerald-100",
      description: "Successfully completed and closed.",
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        role="region"
        aria-label="Complaint statistics overview"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Tooltip key={stat.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatClick?.(stat.id)}
                  className="group relative w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
                  aria-label={`${stat.label}: ${stat.value} complaints. ${stat.description}`}
                >
                  <Card
                    className={cn(
                      "h-full border-2 transition-all duration-300 ease-out",
                      "hover:scale-[1.02] hover:shadow-lg",
                      "active:scale-[0.98]",
                      stat.borderColor,
                      stat.accent,
                      stat.shadowHover
                    )}
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                      {/* Icon + Chevron Row */}
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div
                          className={cn(
                            "p-2 sm:p-2.5 rounded-xl transition-all duration-300",
                            stat.bg,
                            stat.color,
                            "group-hover:scale-110 group-hover:shadow-md"
                          )}
                        >
                          <Icon
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                          <ChevronRight
                            className="w-4 h-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      {/* Label + Value */}
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          {stat.label}
                          {stat.warning && (
                            <AlertCircle
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 animate-pulse"
                              aria-label="Action needed"
                            />
                          )}
                        </p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                            {stat.value}
                          </h3>
                          {stat.warning && (
                            <span className="text-[9px] sm:text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              Action needed
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="text-xs max-w-[220px] bg-popover border shadow-lg"
                sideOffset={8}
              >
                <p className="font-medium mb-1">{stat.description}</p>
                <p className="text-muted-foreground/80 text-[11px] italic">
                  Click to filter dashboard
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}