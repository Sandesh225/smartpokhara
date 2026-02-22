"use client";

import { useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, RefreshCw, Search, CheckCircle,
  Clock, FileText, Activity, Inbox, X, Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyComplaints } from "@/features/complaints/hooks/useMyComplaints";
import { useUserComplaintStats } from "@/features/complaints";
import { ComplaintsTable } from "./ComplaintsTable";

// ─── Skeleton pulse ───────────────────────────────────────────────────────────
function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted/80 dark:bg-muted/50", className)} style={style} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatProps {
  label: string;
  value: number;
  icon: React.ElementType;
  barColor: string;  
  iconBg: string;
  iconColor: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, barColor, iconBg, iconColor, delay = 0 }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-card border border-border rounded-2xl px-6 py-5 overflow-hidden
        hover:-translate-y-1 hover:shadow-lg transition-all duration-400 group"
    >
      {/* Accent Line */}
      <div className={cn("absolute left-0 inset-y-4 w-1 rounded-r-full transition-all duration-400 group-hover:w-1.5", barColor)} />

      {/* Background Glow */}
      <div className={cn("absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity", barColor)} />

      <div className="flex items-center justify-between gap-4 pl-2 relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
          <span className="text-3xl font-heading font-black text-foreground tabular-nums leading-none drop-shadow-sm">
            {value}
          </span>
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-400 group-hover:scale-110", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────
interface ComplaintsContentProps {
  initialUserId: string;
  initialStats: any;
  initialComplaints: any;
}

export function ComplaintsContent({ initialUserId, initialStats, initialComplaints }: ComplaintsContentProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const timerRef     = useRef<NodeJS.Timeout | null>(null);

  const [search,          setSearch]          = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page,            setPage]            = useState(Number(searchParams.get("page")) || 1);
  const pageSize = 10;

  const {
    data: complaintsData,
    isLoading,
    isRefetching,
    refetch,
  } = useMyComplaints(initialUserId, { search: debouncedSearch }, page, pageSize, initialComplaints);

  const { data: stats } = useUserComplaintStats(initialUserId);

  const complaints   = complaintsData?.data  || initialComplaints?.data  || [];
  const total        = complaintsData?.total || initialComplaints?.total || 0;
  const currentStats = stats || initialStats;

  const updateParams = useCallback((params: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    router.replace(`?${p.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      updateParams({ search: value, page: "1" });
    }, 380);
  };

  // Strictly utilizing theme colors: Primary, Secondary, Accent, and Muted
  const STATS: StatProps[] = [
    { label: "Total Filed",   value: currentStats?.total       || 0, icon: FileText,    barColor: "bg-foreground",  iconBg: "bg-muted",          iconColor: "text-foreground",       delay: 0    },
    { label: "Pending",       value: currentStats?.open        || 0, icon: Clock,       barColor: "bg-secondary",   iconBg: "bg-secondary/10",   iconColor: "text-secondary",        delay: 0.1  },
    { label: "In Progress",   value: currentStats?.in_progress || 0, icon: Activity,    barColor: "bg-accent",      iconBg: "bg-accent/20",      iconColor: "text-accent-foreground",delay: 0.2  },
    { label: "Resolved",      value: currentStats?.resolved    || 0, icon: CheckCircle, barColor: "bg-primary",     iconBg: "bg-primary/10",     iconColor: "text-primary",          delay: 0.3  },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/40 border border-primary/10 mb-4">
            <Fingerprint className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wide text-primary">Citizen Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-black text-foreground tracking-tight mb-2">
            My Complaints
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-xl">
            View, track, and manage all your filed reports in one secure place.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-border
              bg-card text-sm font-semibold text-foreground shadow-sm
              hover:bg-muted hover:border-primary/30 transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefetching && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => router.push("/citizen/complaints/new")}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl
              bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20
              hover:opacity-90 hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Complaint
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Table card ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-border bg-muted/10">

          {/* Search */}
          <div className="relative flex-1 sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by title or tracking ID…"
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-input bg-background
                text-sm font-medium text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-all shadow-inner-sm"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right meta */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 border border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Live</span>
            </div>

            {total > 0 && !isLoading && (
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-muted border border-border">
                <span className="text-xs font-bold text-muted-foreground">
                  {total.toLocaleString()} {total !== 1 ? "Records" : "Record"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Table / States */}
        <AnimatePresence mode="wait">

          {/* Loading skeleton */}
          {isLoading && !complaints.length && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-3 p-6">
                {[...Array(6)].map((_, i) => (
                  <Pulse key={i} className="h-16 rounded-xl" style={{ opacity: 1 - i * 0.12 }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && complaints.length === 0 && (
            <motion.div key="empty"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/30 border border-primary/10 flex items-center justify-center mb-6 shadow-sm">
                <Inbox className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                {search ? "No results found" : "No complaints yet"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-8 leading-relaxed">
                {search
                  ? `We couldn't find anything matching "${search}". Please try a different keyword or Tracking ID.`
                  : "You haven't filed any complaints yet. Submit your first one to help us protect the city together."}
              </p>
              {!search && (
                <button
                  onClick={() => router.push("/citizen/complaints/new")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                    border-2 border-primary bg-background text-sm font-bold text-primary
                    hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  File First Complaint
                </button>
              )}
            </motion.div>
          )}

          {/* Data table */}
          {complaints.length > 0 && (
            <motion.div key="table"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ComplaintsTable
                complaints={complaints}
                total={total}
                isLoading={isLoading}
                currentPage={page}
                pageSize={pageSize}
                onPageChange={p => { setPage(p); updateParams({ page: p.toString() }); }}
                onSortChange={(col, ord) => { updateParams({ sortBy: col, sortOrder: ord }); }}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}