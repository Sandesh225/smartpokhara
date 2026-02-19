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
      color: "text-warning",
      bg: "bg-warning/10",
      accent: "group-hover:border-warning",
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
      color: "text-success",
      bg: "bg-success/10",
      accent: "group-hover:border-success",
      description: "Successfully completed and closed.",
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 xl:gap-10"
        role="region"
        aria-label="Complaint statistics overview"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Tooltip key={stat.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatClick?.(stat.id)}
                  className="group relative w-full text-left outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-[32px] transition-all duration-500"
                  aria-label={`${stat.label}: ${stat.value}. ${stat.description}`}
                >
                  <Card
                    className={cn(
                      "stone-card h-full transition-all duration-700 ease-out overflow-hidden bg-card/40 backdrop-blur-xl border border-border/40 rounded-[32px] shadow-2xl",
                      "hover:scale-[1.05] hover:bg-card/60 hover:shadow-primary/5 active:scale-[0.95]",
                      stat.accent
                    )}
                  >
                    <CardContent className="p-8 lg:p-10 flex flex-col justify-between h-full relative z-10">
                      {/* Top Row: Icon & Action Indicator */}
                      <div className="flex justify-between items-start mb-8">
                        <div
                          className={cn(
                            "p-4 rounded-2xl transition-all duration-500 shadow-inner",
                            stat.bg,
                            stat.color,
                            "group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg"
                          )}
                        >
                          <Icon className="w-6 h-6" aria-hidden="true" strokeWidth={2.5} />
                        </div>
                        <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                          <ChevronRight className="w-4 h-4 text-primary" strokeWidth={3} />
                        </div>
                      </div>

                      {/* Bottom Row: Label & Value */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                          {stat.label}
                          {stat.warning && (
                            <AlertCircle
                              className="w-3.5 h-3.5 text-warning animate-pulse"
                            />
                          )}
                        </p>
                        <div className="flex items-baseline gap-3">
                          <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground tabular-nums dark:text-glow">
                            {stat.value}
                          </h3>
                          {stat.warning && (
                            <span className="text-[9px] font-black text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded-lg uppercase tracking-widest">
                              Peak
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Background Accents */}
                      <div
                        className={cn(
                          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-[0.05]",
                          stat.bg
                        )}
                      />
                    </CardContent>
                  </Card>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-card/90 backdrop-blur-xl border-border/40 shadow-2xl p-5 rounded-2xl text-[10px] max-w-[220px]"
                sideOffset={15}
              >
                <p className="font-black text-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", stat.bg, "shadow-sm")} />
                  {stat.label}
                </p>
                <p className="text-muted-foreground font-medium leading-relaxed tracking-tight">
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
