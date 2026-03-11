"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  MapPin,
  Sun,
  Moon,
  ArrowRight
} from "lucide-react";
import dynamic from "next/dynamic";
import { UniversalStatCard } from "@/components/shared/UniversalStatCard";
import { cn } from "@/lib/utils";
import { CurrentTime } from "./CurrentTime";

// Dynamic Imports for Performance
const QuickActions = dynamic(() => import("./QuickActions"), { 
  loading: () => <div className="h-48 bg-muted/20 animate-pulse rounded-2xl" /> 
});
const RecentComplaints = dynamic(() => import("./RecentComplaints"), {
  loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-2xl" />
});
const RecentNotices = dynamic(() => import("./RecentNotices"), {
  loading: () => <div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />
});
const PendingBills = dynamic(() => import("./PendingBills"), {
  loading: () => <div className="h-48 bg-muted/20 animate-pulse rounded-2xl" />
});

interface DashboardContentProps {
  profile: {
    name: string;
    wardNumber: number | null;
    wardName: string;
    wardId: string | null;
  };
  complaints: any[];
  bills: any[];
  notices: any[];
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
}

export function DashboardContent({ 
  profile, 
  complaints, 
  bills, 
  notices, 
  stats 
}: DashboardContentProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { label: "Good Morning", icon: Sun };
    if (hour < 18) return { label: "Good Afternoon", icon: Sun };
    return { label: "Good Evening", icon: Moon };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const activeCount = stats.open + stats.inProgress;
  const totalPendingAmount = bills.reduce(
    (sum, bill) => sum + (bill.total_amount || 0), 0
  );
  const GreetIcon = greeting.icon;

  const statCards = [
    {
      id: "all",
      label: "Total Requests",
      value: stats.total,
      icon: FileText,
      iconClassName: "bg-foreground text-card",
    },
    {
      id: "open",
      label: "Awaiting Review",
      value: stats.open,
      icon: Clock,
      iconClassName: "bg-secondary text-secondary-foreground",
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: stats.inProgress,
      icon: Activity,
      iconClassName: "bg-accent text-accent-foreground",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      iconClassName: "bg-primary text-primary-foreground",
    },
  ];

  return (
    // ✅ Supreme Consistency: Strict max-w-7xl, gap-8 layout
 <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 sm:space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-3">
          <div>
            {/* ✅ Fix: Changed from text-accent to text-primary so it's always visible! */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3 shadow-sm">
              <GreetIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {greeting.label}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {profile.name}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="p-1.5 bg-muted rounded-lg border border-border shadow-sm">
                <MapPin className="w-4 h-4 text-secondary" />
              </div>
              {profile.wardName
                ? `${profile.wardName} · Ward ${profile.wardNumber}`
                : "Pokhara Metropolitan"}
            </span>
            <CurrentTime />
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm hover:bg-muted hover:border-primary/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2 transition-transform", isRefreshing ? "animate-spin text-primary" : "text-muted-foreground")} />
          Refresh Data
        </button>
      </header>

      {/* ── Active Alert Banner ── */}
      {activeCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-primary/20 bg-card shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
              <div className="relative w-3.5 h-3.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
            </div>
            <p className="text-sm text-foreground font-medium">
              You currently have <span className="font-bold text-primary text-base mx-1">{activeCount}</span>
              {activeCount === 1 ? "request" : "requests"} in progress.
            </p>
          </div>
          <button
            onClick={() => router.push("/citizen/complaints")}
            className="group inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Track Progress
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      )}

      {/* ── Stats Row ── */}
      <section aria-label="Request statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <UniversalStatCard
              key={stat.id}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              onClick={() => router.push(`/citizen/complaints?status=${stat.id}`)}
              iconClassName={stat.iconClassName}
            />
          ))}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section aria-labelledby="quick-actions-heading">
        <div className="mb-6 space-y-1">
          <h2 id="quick-actions-heading" className="text-2xl font-bold text-foreground tracking-tight">
            Civic Services
          </h2>
          <p className="text-sm text-muted-foreground">
            Quick access to essential municipal services and portals.
          </p>
        </div>
        <QuickActions
          complaintsCount={stats.total}
          pendingBillsCount={bills.length}
        />
      </section>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <section aria-label="Recent complaint activity">
            <RecentComplaints complaints={complaints} />
          </section>
        </div>

        <div className="space-y-8">
          <section aria-label="Public announcements">
            <RecentNotices notices={notices} />
          </section>
          
          <section aria-label="Pending financial obligations">
            <PendingBills
              bills={bills}
              totalPendingAmount={totalPendingAmount}
            />
          </section>
        </div>
        
      </div>

    </main>
  );
}