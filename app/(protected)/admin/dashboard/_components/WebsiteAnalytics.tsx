"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebsiteMetric } from "@/features/admin-dashboard/types";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebsiteAnalytics({ data }: { data: WebsiteMetric[] }) {
  return (
    <Card className="stone-card border-none  transition-all duration-300 hover:elevation-4">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-sky-500/10">
                <Activity className="w-5 h-5 text-sky-600" />
              </div>
              {/* Live Status Ping Animation */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </div>
            System Health
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Live Feed
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.map((metric, i) => (
              <div
                key={i}
                className={cn(
                  "relative group p-5 rounded-2xl border transition-all duration-300",
                  "bg-linear-to-b from-slate-50 to-white",
                  "border-slate-200/60 hover:border-sky-200 hover:elevation-2"
                )}
              >
                {/* Subtle Background Icon Decor */}
                <div className="absolute right-2 bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Activity className="w-12 h-12" />
                </div>

                <div className="relative z-10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {metric.label}
                  </h4>

                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-2xl font-mono font-bold text-slate-900 tracking-tighter tabular-nums">
                      {metric.value}
                    </p>

                    {metric.change && (
                      <div
                        className={cn(
                          "flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-bold font-mono border",
                          metric.trend === "up"
                            ? "bg-green-500/10 text-green-700 border-green-500/20"
                            : "bg-red-500/10 text-red-700 border-red-500/20"
                        )}
                      >
                        {metric.trend === "up" ? (
                          <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                        ) : (
                          <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                        )}
                        {metric.change}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <Activity className="w-12 h-12 text-slate-300 mb-4 opacity-50" />
            <p className="text-sm font-bold text-slate-500">
              Synchronizing Data...
            </p>
            <p className="text-xs text-slate-400 mt-1 italic">
              Establishing connection to Pokhara Cloud
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
