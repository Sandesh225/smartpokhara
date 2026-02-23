"use client";

import { useState, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Sun,
  Moon,
  ArrowRight
} from "lucide-react";
import { UniversalStatCard } from "@/components/shared/UniversalStatCard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import QuickActions from "./QuickActions";
import RecentComplaints from "./RecentComplaints";
import RecentNotices from "./RecentNotices";
import PendingBills from "./PendingBills";
import { CurrentTime } from "./CurrentTime";

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

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5, 
      delay: i * 0.1, 
      ease: [0.22, 1, 0.36, 1] as any 
    },
  }),
};

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 border-b border-border/60"
        >
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/40 border border-primary/10 mb-3 shadow-sm">
                <GreetIcon className="w-4 h-4 text-primary" />
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-primary">
                  {greeting.label}
                </span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                {profile.name}
              </h1>
            </div>
            
            <div className="font-sans flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="p-1.5 bg-card rounded-lg border border-border shadow-sm">
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
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border bg-card text-sm font-heading font-bold text-foreground shadow-sm hover:bg-muted hover:border-primary/30 transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2.5 text-muted-foreground", isRefreshing && "animate-spin text-primary")} />
            Refresh Data
          </button>
        </motion.div>

        {/* ── Active Alert Banner ── */}
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 rounded-2xl border border-primary/20 bg-primary/5 shadow-inner-sm">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
                    <div className="relative w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  </div>
                  <p className="font-sans text-sm text-foreground">
                    You currently have <span className="font-heading font-black text-primary text-base mx-1">{activeCount}</span>
                    {activeCount === 1 ? "request" : "requests"} in progress.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/citizen/complaints")}
                  className="group inline-flex items-center font-heading text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Track Progress
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Row ── */}
        <section aria-label="Request statistics">
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 perf-card"
          >
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
          </motion.div>
        </section>

        {/* ── Quick Actions ── */}
        <motion.section
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          aria-labelledby="quick-actions-heading"
        >
          <div className="mb-6">
            <h2 id="quick-actions-heading" className="font-heading text-lg font-extrabold text-foreground tracking-tight">
              Civic Services
            </h2>
            <p className="font-sans text-sm text-muted-foreground mt-1">
              Quick access to essential municipal services and portals.
            </p>
          </div>
          <QuickActions
            complaintsCount={stats.total}
            pendingBillsCount={bills.length}
          />
        </motion.section>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="lg:col-span-2"
          >
            <section aria-label="Recent complaint activity">
              <RecentComplaints complaints={complaints} />
            </section>
          </motion.div>

          <div className="space-y-6 lg:space-y-8">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="perf-offscreen">
              <section aria-label="Public announcements">
                <RecentNotices notices={notices} />
              </section>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="perf-offscreen">
              <section aria-label="Pending financial obligations">
                <PendingBills
                  bills={bills}
                  totalPendingAmount={totalPendingAmount}
                />
              </section>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
