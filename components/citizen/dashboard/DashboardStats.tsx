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
      label: "Total Requests",
      value: totalComplaints,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      borderColor: "border-primary/20",
      accent: "group-hover:border-primary",
      shadowHover: "group-hover:elevation-3",
      description: "All issues you have reported to the municipality.",
    },
    {
      id: "open",
      label: "Awaiting Review",
      value: openCount,
      icon: Clock,
      color: "text-[rgb(var(--warning-amber))]",
      bg: "bg-amber-50",
      borderColor: "border-amber-100",
      accent: "group-hover:border-[rgb(var(--warning-amber))]",
      shadowHover: "group-hover:elevation-3",
      description: "Submitted and waiting for staff assignment.",
      warning: openCount > 5,
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: inProgressCount,
      icon: Activity,
      color: "text-secondary",
      bg: "bg-secondary/10",
      borderColor: "border-secondary/20",
      accent: "group-hover:border-secondary",
      shadowHover: "group-hover:elevation-3",
      description: "City staff are currently working on resolution.",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "text-[rgb(var(--success-green))]",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-100",
      accent: "group-hover:border-[rgb(var(--success-green))]",
      shadowHover: "group-hover:elevation-3",
      description: "Successfully completed and closed.",
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
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
                  className="group relative w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
                  aria-label={`${stat.label}: ${stat.value} complaints. ${stat.description}`}
                >
                  <Card
                    className={cn(
                      "h-full transition-all duration-300 ease-out stone-card",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      stat.accent,
                      stat.shadowHover
                    )}
                  >
                    <CardContent className="card-padding flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-all duration-300 elevation-1",
                            stat.bg,
                            stat.color,
                            "group-hover:scale-110 group-hover:elevation-2"
                          )}
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                          <ChevronRight
                            className="w-4 h-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          {stat.label}
                          {stat.warning && (
                            <AlertCircle
                              className="w-3.5 h-3.5 text-[rgb(var(--warning-amber))] animate-pulse"
                              aria-label="Action needed"
                            />
                          )}
                        </p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="text-3xl font-bold tracking-tight text-foreground tabular-nums font-mono">
                            {stat.value}
                          </h3>
                          {stat.warning && (
                            <span className="text-[10px] font-medium text-[rgb(var(--warning-amber))] bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
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
                className="text-xs max-w-[220px] glass"
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
