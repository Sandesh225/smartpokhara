"use client";

import { DashboardMetrics } from "./DashboardMetrics";
import { QuickActions } from "./QuickActions";
import { ComplaintsOverview } from "./ComplaintsOverview";
import { TeamOverview } from "./TeamOverview";
import { RealTimeAlerts } from "./RealTimeAlerts";
import { ActivityFeed } from "./ActivityFeed";

interface DashboardContentProps {
  initialUserId: string;
  metrics: any;
  statusData: any;
  categoryData: any;
  trendData: any;
  activityData: any;
  staffData: any;
  alerts: any[];
}

export function DashboardContent({
  initialUserId,
  metrics,
  statusData,
  categoryData,
  trendData,
  activityData,
  staffData,
  alerts,
}: DashboardContentProps) {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-background min-h-screen transition-colors duration-300">
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor complaints, team performance, and key metrics for your
          jurisdiction.
        </p>
      </header>

      {/* Header Metrics Cards */}
      <section aria-label="Key performance metrics" className="perf-card">
        <DashboardMetrics metrics={metrics} />
      </section>

      {/* Quick Actions Bar */}
      <nav aria-label="Operational shortcuts">
        <QuickActions
          counts={{
            unassigned: metrics.unassignedCount,
            overdue: metrics.overdueCount,
          }}
        />
      </nav>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts & Tables) */}
        <div className="lg:col-span-2 space-y-6">
          <section aria-label="Operational performance charts" className="bg-card border border-border rounded-xl shadow-xs p-5 md:p-6 transition-all duration-300 perf-offscreen">
            <h2 className="text-base md:text-lg font-bold text-foreground tracking-tight mb-4 md:mb-5">
              Operational Performance
            </h2>
            <ComplaintsOverview
              statusData={statusData}
              categoryData={categoryData}
              trendData={trendData}
            />
          </section>

          <section aria-label="Team member overview" className="bg-card border border-border rounded-xl shadow-xs transition-all duration-300 overflow-hidden perf-offscreen">
            <TeamOverview staff={staffData} />
          </section>
        </div>

        {/* Right Column (Sidebar/Feeds) */}
        <aside aria-label="Alerts and activity" className="space-y-6">
          {/* Alerts Panel */}
          <section aria-label="Critical alerts" className="min-h-[200px] bg-warning-amber/5 border border-warning-amber/20 rounded-xl p-5 md:p-6 shadow-xs">
            <h3 className="text-sm font-bold text-warning-amber mb-4">
              Critical Alerts
            </h3>
            <RealTimeAlerts initialAlerts={alerts} />
          </section>

          {/* Activity Feed Panel */}
          <section aria-label="Live activity feed" className="min-h-[400px] bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs perf-offscreen">
            <h3 className="text-base md:text-lg font-bold text-foreground tracking-tight mb-4 md:mb-5">Live Activity</h3>
            <ActivityFeed initialActivity={activityData} />
          </section>
        </aside>
      </div>
    </div>
  );
}
