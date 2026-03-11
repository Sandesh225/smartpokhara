"use client";

import { useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} style={style} />;
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
    <div
      className="relative bg-card border border-border rounded-2xl px-5 sm:px-6 py-5 overflow-hidden
        hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group animate-fade-in"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      {/* Accent Line */}
      <div className={cn("absolute left-0 inset-y-4 w-1 rounded-r-full transition-all duration-200 group-hover:w-1.5", barColor)} />

      <div className="flex items-center justify-between gap-4 pl-2 relative z-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
          <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
            {value}
          </span>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
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

  const STATS: StatProps[] = [
    { label: "Total Filed",   value: currentStats?.total       || 0, icon: FileText,    barColor: "bg-foreground",  iconBg: "bg-muted",          iconColor: "text-foreground",       delay: 0    },
    { label: "Pending",       value: currentStats?.open        || 0, icon: Clock,       barColor: "bg-secondary",   iconBg: "bg-secondary/10",   iconColor: "text-secondary",        delay: 0.05  },
    { label: "In Progress",   value: currentStats?.in_progress || 0, icon: Activity,    barColor: "bg-accent",      iconBg: "bg-accent/10",      iconColor: "text-accent",           delay: 0.1  },
    { label: "Resolved",      value: currentStats?.resolved    || 0, icon: CheckCircle, barColor: "bg-primary",     iconBg: "bg-primary/10",     iconColor: "text-primary",          delay: 0.15  },
  ];

  return (
    // ✅ THE FIX: Standardized vertical spacing to match Dashboard exactly
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full">

      {/* ── Page header ── */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Fingerprint className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wide text-primary">Citizen Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
            My Complaints
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            View, track, and manage all your filed reports in one secure place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-border
              bg-card text-sm font-semibold text-foreground shadow-sm
              hover:bg-muted hover:border-primary/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 transition-transform", isRefetching ? "animate-spin text-primary" : "text-muted-foreground")} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={() => router.push("/citizen/complaints/new")}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl
              bg-primary text-primary-foreground text-sm font-semibold shadow-sm
              hover:opacity-90 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Complaint
          </button>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Table card ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-5 sm:px-6 py-4 border-b border-border bg-muted/30">

          {/* Search */}
          <div className="relative flex-1 sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by title or tracking ID…"
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-input bg-background
                text-sm font-medium text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary
                transition-all shadow-sm"
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Live</span>
            </div>

            {total > 0 && !isLoading && (
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground">
                  {total.toLocaleString()} {total !== 1 ? "Records" : "Record"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Table / States */}
        {/* Loading skeleton */}
        {isLoading && !complaints.length && (
          <div className="space-y-3 p-5 sm:p-6 animate-fade-in">
            {[...Array(6)].map((_, i) => (
              <Pulse key={i} className="h-16 rounded-xl" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && complaints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5 shadow-sm">
              <Inbox className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {search ? "No results found" : "No complaints yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
              {search
                ? `We couldn't find anything matching "${search}". Try a different keyword.`
                : "You haven't filed any complaints yet. Submit your first one to help us protect the city together."}
            </p>
            {!search && (
              <button
                onClick={() => router.push("/citizen/complaints/new")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                  border border-border bg-card text-sm font-semibold text-foreground
                  hover:bg-muted hover:border-primary/50 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4 text-primary" />
                File First Complaint
              </button>
            )}
          </div>
        )}

        {/* Data table */}
        {complaints.length > 0 && (
          <div className="animate-fade-in">
            <ComplaintsTable
              complaints={complaints}
              total={total}
              isLoading={isLoading}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={p => { setPage(p); updateParams({ page: p.toString() }); }}
              onSortChange={(col, ord) => { updateParams({ sortBy: col, sortOrder: ord }); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}