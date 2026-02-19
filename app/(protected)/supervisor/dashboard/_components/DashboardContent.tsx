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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Monitor complaints, team performance, and key metrics for your
          jurisdiction.
        </p>
      </div>

      {/* Header Metrics Cards */}
      <DashboardMetrics metrics={metrics} />

      {/* Quick Actions Bar */}
      <div className="stone-card p-1 shadow-sm">
        <QuickActions
          counts={{
            unassigned: metrics.unassignedCount,
            overdue: metrics.overdueCount,
          }}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts & Tables) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="stone-card p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Operational Performance
            </h2>
            <ComplaintsOverview
              statusData={statusData}
              categoryData={categoryData}
              trendData={trendData}
            />
          </section>

          <section className="stone-card shadow-md overflow-hidden">
            <TeamOverview staff={staffData} />
          </section>
        </div>

        {/* Right Column (Sidebar/Feeds) */}
        <div className="space-y-6">
          {/* Alerts Panel */}
          <div className="min-h-[200px] stone-card border-primary/20 bg-primary/5 p-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
              Critical Alerts
            </h3>
            <RealTimeAlerts initialAlerts={alerts} />
          </div>

          {/* Activity Feed Panel */}
          <div className="min-h-[400px] stone-card p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Live Activity</h3>
            <ActivityFeed initialActivity={activityData} />
          </div>
        </div>
      </div>
    </div>
  );
}
