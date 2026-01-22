"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  X,
  ShieldCheck,
  Wifi,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Container,
  Section,
  PageHeader,
  Grid,
} from "@/lib/design-system/container";

import { createClient } from "@/lib/supabase/client";
import { ComplaintsTable } from "@/app/(protected)/citizen/complaints/_components/ComplaintsTable";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type { Complaint } from "@/lib/supabase/queries/complaints";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────── */
/* 1. Registry Stat Card (Increased Size) */
/* ─────────────────────────────────────────── */
function RegistryStat({
  label,
  value,
  icon: Icon,
  colorClass,
  description,
}: {
  label: string;
  value: number;
  icon: any;
  colorClass: string;
  description?: string;
}) {
  return (
    <Card className="stone-card border-border shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex items-stretch h-40">
          {" "}
          {/* Height increased from 32 to 40 */}
          <div className={cn("w-3", colorClass)} /> {/* Bar thickened */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {label} {/* text-[10px] -> text-sm */}
                </p>
                <h3 className="text-5xl font-black tabular-nums text-foreground mt-2 tracking-tighter">
                  {value} {/* text-3xl -> text-5xl */}
                </h3>
              </div>
              <div className={cn("p-3 rounded-2xl bg-muted/50")}>
                <Icon
                  className={cn("w-7 h-7", colorClass.replace("bg-", "text-"))}
                />
              </div>
            </div>
            {description && (
              <p className="text-sm font-bold text-muted-foreground/80 italic">
                {description} {/* text-[11px] -> text-sm */}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const pageSize = 10;

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

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      updateParams({ search: value, page: "1" });
    }, 400);
  };

  const fetchData = useCallback(
    async (silent = false) => {
      silent ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const [res, statsRes] = await Promise.all([
          complaintsService.getUserComplaints({
            search_term: debouncedSearch || undefined,
            limit: pageSize,
            offset: (page - 1) * pageSize,
          }),
          complaintsService.getDashboardStats(),
        ]);
        setComplaints(res.complaints);
        setTotal(res.total);
        setStats(statsRes.complaints);
      } catch (err) {
        toast.error("Network Error", {
          description: "Failed to fetch records.",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [debouncedSearch, page]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-background">
      <Container size="wide" className="py-12 -mt-12">
        {" "}
        {/* Increased padding */}
        <Section>
          <PageHeader
            title={
              <span className="text-5xl font-black">My Complaints</span>
            } // Forced size
            subtitle={
              <span className="text-xl font-medium mt-3 block text-muted-foreground">
                Track and manage your official municipal reports.
              </span>
            }
            badge={
              <div className="flex gap-3">
                <Badge className="glass bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border-2 border-primary/20 px-4 py-2">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Secured
                </Badge>
                <Badge className="glass bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest border-2 border-secondary/20 px-4 py-2">
                  <Wifi className="w-4 h-4 mr-2" />
                  Live Sync
                </Badge>
              </div>
            }
            actions={
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => fetchData(true)}
                  className="h-14 px-8 rounded-xl border-2 font-black text-base"
                >
                  <RefreshCw
                    className={cn(
                      "w-5 h-5 mr-3",
                      isRefreshing && "animate-spin"
                    )}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() => router.push("/citizen/complaints/new")}
                  className="h-14 px-10 rounded-xl bg-primary text-primary-foreground font-black text-base shadow-xl"
                >
                  <Plus className="w-6 h-6 mr-3 stroke-[3]" />
                  Log New Case
                </Button>
              </div>
            }
          />

          <Grid cols={4} className="mb-12 gap-6">
            <RegistryStat
              label="Total Cases"
              value={stats.total}
              icon={FileText}
              colorClass="bg-primary-brand"
              description="Lifetime history"
            />
            <RegistryStat
              label="Pending"
              value={stats.open}
              icon={Clock}
              colorClass="bg-amber-500"
              description="Awaiting review"
            />
            <RegistryStat
              label="Active"
              value={stats.in_progress}
              icon={Activity}
              colorClass="bg-blue-500"
              description="In progress"
            />
            <RegistryStat
              label="Resolved"
              value={stats.resolved}
              icon={CheckCircle}
              colorClass="bg-secondary"
              description="Closed"
            />
          </Grid>

          <Card className="stone-card border-2 border-border overflow-hidden bg-card shadow-xl">
            <CardHeader className="border-b-2 border-border bg-muted/30 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative w-full max-w-2xl">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by Case ID, Title..."
                    className="h-16 pl-14 pr-14 rounded-xl text-lg font-bold border-2 focus:ring-4"
                  />
                </div>

                <div className="flex items-center gap-3 text-sm font-black text-muted-foreground uppercase tracking-widest">
                  <AlertCircle className="w-5 h-5" />
                  Viewing {complaints.length} of {total} records
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="flex flex-col h-[500px] items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-lg font-black text-primary uppercase tracking-tighter">
                      Syncing Database...
                    </p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="py-40 text-center">
                    <Inbox className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
                    <h3 className="text-3xl font-black text-foreground">
                      Registry Empty
                    </h3>
                  </div>
                ) : (
                  <ComplaintsTable
                    complaints={complaints}
                    total={total}
                    currentPage={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                  />
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Section>
      </Container>
    </div>
  );
}