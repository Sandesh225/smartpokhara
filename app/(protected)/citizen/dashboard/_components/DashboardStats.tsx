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
      // Uses Phewa Deep Blue (Primary)
      color: "text-primary",
      bg: "bg-primary/10",
      accent: "group-hover:border-primary",
      description: "All issues you have reported to the municipality.",
    },
    {
      id: "open",
      label: "Awaiting Review",
      value: openCount,
      icon: Clock,
      // Uses Marigold/Amber (Warning)
      color: "text-[rgb(var(--warning-amber))]",
      bg: "bg-[rgb(var(--warning-amber))]/10",
      accent: "group-hover:border-[rgb(var(--warning-amber))]",
      description: "Submitted and waiting for staff assignment.",
      warning: openCount > 5,
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: inProgressCount,
      icon: Activity,
      // Uses Lakeside Teal (Secondary)
      color: "text-secondary",
      bg: "bg-secondary/10",
      accent: "group-hover:border-secondary",
      description: "City staff are currently working on resolution.",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      // Uses Success Green
      color: "text-[rgb(var(--success-green))]",
      bg: "bg-[rgb(var(--success-green))]/10",
      accent: "group-hover:border-[rgb(var(--success-green))]",
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
                  aria-label={`${stat.label}: ${stat.value}. ${stat.description}`}
                >
                  <Card
                    className={cn(
                      // Semantic Stone Card class from your CSS
                      "stone-card h-full transition-all duration-300 ease-out overflow-hidden",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "group-hover:elevation-3",
                      stat.accent
                    )}
                  >
                    <CardContent className="p-5 lg:p-6 flex flex-col justify-between h-full relative z-10">
                      {/* Top Row: Icon & Action Indicator */}
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
                        <ChevronRight
                          className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                          aria-hidden="true"
                        />
                      </div>

                      {/* Bottom Row: Label & Value */}
                      <div className="space-y-1">
                        <p className="text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          {stat.label}
                          {stat.warning && (
                            <AlertCircle
                              className="w-3 h-3 text-[rgb(var(--warning-amber))] animate-pulse"
                              aria-label="High volume"
                            />
                          )}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums font-mono">
                            {stat.value}
                          </h3>
                          {stat.warning && (
                            <span className="text-[9px] font-bold text-[rgb(var(--warning-amber))] bg-[rgb(var(--warning-amber))]/10 border border-[rgb(var(--warning-amber))]/20 px-1.5 py-0.5 rounded-md uppercase">
                              Attention
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subtle Background Decorative Gradient */}
                      <div
                        className={cn(
                          "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-opacity group-hover:opacity-[0.07]",
                          stat.bg
                        )}
                      />
                    </CardContent>
                  </Card>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                // Using your glass utility
                className="glass text-xs max-w-[200px] border-border shadow-xl p-3"
                sideOffset={8}
              >
                <p className="font-bold text-foreground mb-1">{stat.label}</p>
                <p className="text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}