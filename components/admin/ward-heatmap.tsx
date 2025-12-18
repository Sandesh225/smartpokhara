"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WardSummary } from "@/lib/types/admin";

interface WardHeatmapProps {
  wardData: WardSummary[];
}

export function WardHeatmap({ wardData }: WardHeatmapProps) {
  const getComplaintIntensity = (count: number) => {
    if (count === 0)
      return "bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800";
    if (count <= 5)
      return "bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800";
    if (count <= 15)
      return "bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800";
    return "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800";
  };

  const getComplaintTextColor = (count: number) => {
    if (count === 0) return "text-emerald-700 dark:text-emerald-300";
    if (count <= 5) return "text-amber-700 dark:text-amber-300";
    if (count <= 15) return "text-orange-700 dark:text-orange-300";
    return "text-red-700 dark:text-red-300";
  };

  if (wardData.length === 0) {
    return (
      <div className="flex flex-col h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <MapPin className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No ward complaint data available
        </p>
      </div>
    );
  }

  const allWards = Array.from({ length: 33 }, (_, i) => {
    const wardNumber = i + 1;
    const ward = wardData.find((w) => w.ward_number === wardNumber);
    return (
      ward || {
        ward_number: wardNumber,
        ward_name: `Ward ${wardNumber}`,
        total_complaints: 0,
        open_complaints: 0,
        resolved_complaints: 0,
        overdue_complaints: 0,
      }
    );
  });

  const totals = {
    total: allWards.reduce((sum, w) => sum + w.total_complaints, 0),
    open: allWards.reduce((sum, w) => sum + w.open_complaints, 0),
    resolved: allWards.reduce((sum, w) => sum + w.resolved_complaints, 0),
    overdue: allWards.reduce((sum, w) => sum + w.overdue_complaints, 0),
  };

  return (
    <div className="space-y-5">
      {/* Heatmap Grid */}
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-11">
        {allWards.map((ward) => (
          <Link
            key={ward.ward_number}
            href={`/admin/complaints?ward=${ward.ward_number}`}
            className={cn(
              "group relative flex aspect-square items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-md",
              getComplaintIntensity(ward.open_complaints)
            )}
            title={`Ward ${ward.ward_number}: ${ward.open_complaints} open complaints`}
          >
            <span
              className={cn(
                "text-xs font-bold",
                getComplaintTextColor(ward.open_complaints)
              )}
            >
              {ward.ward_number}
            </span>
            {ward.overdue_complaints > 0 && (
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-md bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800" />
            <span className="text-slate-600 dark:text-slate-400">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800" />
            <span className="text-slate-600 dark:text-slate-400">1-5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-md bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800" />
            <span className="text-slate-600 dark:text-slate-400">6-15</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" />
            <span className="text-slate-600 dark:text-slate-400">16+</span>
          </div>
        </div>
        <Link href="/admin/analytics?view=geographic">
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
          >
            Detailed View
          </Button>
        </Link>
      </div>

      {/* Ward Statistics Summary */}
      <div className="rounded-xl bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 p-4 border border-slate-200/80 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totals.total.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totals.open.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Open
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totals.resolved.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Resolved
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totals.overdue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Overdue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
