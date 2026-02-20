"use client";

import { useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  ShieldCheck,
  Wifi,
  Inbox,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMyComplaints } from "@/features/complaints/hooks/useMyComplaints";
import { useUserComplaintStats } from "@/features/complaints";
import { ComplaintsTable } from "./ComplaintsTable";

/* ─────────────────────────────────────────────────────────────
   1. Registry Stat Card
   ───────────────────────────────────────────────────────────── */
function RegistryStat({
  label,
  value,
  icon: Icon,
  colorClass,
  textColorClass,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: any;
  colorClass: string;
  textColorClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", colorClass)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <h3 className="mt-4 text-4xl font-black tracking-tighter text-foreground tabular-nums">
            {value}
          </h3>
        </div>
        <div
          className={cn(
            "rounded-xl bg-muted/50 p-3 transition-colors group-hover:bg-white",
            textColorClass
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

interface ComplaintsContentProps {
  initialUserId: string;
  initialStats: any;
  initialComplaints: any;
}

export function ComplaintsContent({
  initialUserId,
  initialStats,
  initialComplaints,
}: ComplaintsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  // --- State ---
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const pageSize = 10;

  // --- Hooks ---
  const { 
    data: complaintsData, 
    isLoading: isLoadingComplaints, 
    isRefetching: isRefreshing,
    refetch 
  } = useMyComplaints(
    initialUserId,
    { search: debouncedSearch },
    page,
    pageSize,
    initialComplaints
  );

  const { data: stats } = useUserComplaintStats(initialUserId);

  const complaints = complaintsData?.data || initialComplaints?.data || [];
  const total = complaintsData?.total || initialComplaints?.total || 0;
  const currentStats = stats || initialStats;

  // --- Logic: Param Updates ---
  const updateParams = useCallback(
    (params: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) =>
        v ? p.set(k, v) : p.delete(k)
      );
      router.replace(`?${p.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // --- Logic: Search Debounce ---
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      updateParams({ search: value, page: "1" });
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* ── HEADER SECTION (Internal for speed) ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between -mt-4 mb-4">
        {/* Title Area */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-3xl">
              Citizen Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-lg">
            Track and manage your reports in real-time.
          </p>
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefreshing}
            className="h-12 border-2 px-4 font-bold rounded-xl"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
            />
            Sync
          </Button>
          <Button
            onClick={() => router.push("/citizen/complaints/new")}
            className="h-12 bg-primary px-6 font-bold text-primary-foreground shadow-lg hover:shadow-primary/25 rounded-xl transition-all hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5 stroke-3" />
            Log New Case
          </Button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RegistryStat
          label="Total Cases"
          value={currentStats?.total || 0}
          icon={FileText}
          colorClass="bg-primary"
          textColorClass="text-primary"
          delay={0}
        />
        <RegistryStat
          label="Pending Review"
          value={currentStats?.open || 0}
          icon={Clock}
          colorClass="bg-amber-500"
          textColorClass="text-amber-600"
          delay={0.1}
        />
        <RegistryStat
          label="In Progress"
          value={currentStats?.in_progress || 0}
          icon={Activity}
          colorClass="bg-blue-500"
          textColorClass="text-blue-600"
          delay={0.2}
        />
        <RegistryStat
          label="Resolved"
          value={currentStats?.resolved || 0}
          icon={CheckCircle}
          colorClass="bg-emerald-500"
          textColorClass="text-emerald-600"
          delay={0.3}
        />
      </div>

      {/* ── MAIN CONTENT CARD ── */}
      <Card className="overflow-hidden border-none shadow-xl rounded-2xl bg-card">
        {/* Toolbar */}
        <div className="border-b bg-muted/30 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by ID, Title, or Category..."
                className="h-12 rounded-xl border-2 bg-background pl-12 font-medium focus-visible:ring-offset-0"
              />
            </div>

            {/* Filters / Meta */}
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="h-10 px-4 rounded-lg border-2 font-bold text-muted-foreground bg-background"
              >
                <Wifi className="w-3 h-3 mr-2 text-green-500 animate-pulse" />
                Live Database
              </Badge>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl border-2"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
             {isLoadingComplaints && !complaints.length ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-4"
                >
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  <p className="font-bold text-muted-foreground animate-pulse">
                    Retrieving records...
                  </p>
                </motion.div>
             ) : complaints.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-6 text-center"
                >
                  <div className="rounded-full bg-muted p-8">
                    <Inbox className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-foreground">
                      No Complaints Found
                    </h3>
                    <p className="text-muted-foreground">
                      {search
                        ? "Try adjusting your search filters."
                        : "You haven't filed any complaints yet."}
                    </p>
                  </div>
                </motion.div>
             ) : (
                <ComplaintsTable 
                  complaints={complaints}
                  total={total}
                  isLoading={isLoadingComplaints}
                  currentPage={page}
                  pageSize={pageSize}
                  onPageChange={(p: number) => {
                    setPage(p);
                    updateParams({ page: p.toString() });
                  }}
                  onSortChange={(column, order) => {
                    updateParams({ sortBy: column, sortOrder: order });
                  }}
                />
             )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
