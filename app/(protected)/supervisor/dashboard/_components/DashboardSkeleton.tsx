"use client";

import { cn } from "@/lib/utils";

/**
 * DashboardSkeleton
 * Optimized for Machhapuchhre Modern Theme (Integrated Dark/Light)
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      {/* 1. Header Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border border-border/50 p-6 h-32 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-muted rounded-xl" />
              <div className="h-3 w-16 bg-muted rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-12 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Quick Actions Skeleton */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
        <div className="h-5 w-32 bg-muted rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-muted/40 rounded-xl border border-border/30"
            />
          ))}
        </div>
      </div>

      {/* 3. Main Dashboard Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts & Tables) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Large Chart Area */}
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded-lg" />
            </div>
            <div className="h-72 bg-muted/30 rounded-xl border border-dashed border-border/50" />
          </div>

          {/* Table Area */}
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="h-5 w-32 bg-muted rounded mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-muted/20 rounded-lg flex items-center px-4 gap-4"
                >
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="h-3 flex-1 bg-muted" />
                  <div className="h-3 w-20 bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          {/* Alerts Skeleton */}
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="h-4 w-24 bg-muted rounded mb-4" />
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-muted/40 rounded-xl border border-border/30"
                />
              ))}
            </div>
          </div>

          {/* Activity Feed Skeleton */}
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="h-5 w-28 bg-muted rounded mb-6" />
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-[15px] before:w-px before:bg-border/50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className="h-8 w-8 rounded-full bg-muted border-4 border-card z-10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-2 w-20 bg-muted/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
