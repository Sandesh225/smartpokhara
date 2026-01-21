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
import type {
  Complaint,
  ComplaintStatus,
} from "@/lib/supabase/queries/complaints";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────── */
/* Registry Stat Card */
/* ─────────────────────────────────────────── */
function RegistryStat({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: any;
  colorClass: string;
}) {
  return (
    <Card className="stone-card border-2 border-border elevation-2 transition-all hover:elevation-3">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <h3 className="mt-2 text-4xl font-black tabular-nums text-foreground">
              {value}
            </h3>
          </div>
          <div className={cn("p-3 rounded-2xl elevation-1", colorClass)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────── */
/* Main Page */
/* ─────────────────────────────────────────── */
export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const pageSize = 15;

  /* URL Sync */
  const updateParams = (params: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  /* Search */
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      updateParams({ search: value, page: "1" });
    }, 400);
  };

  /* Fetch */
  const fetchData = useCallback(
    async (silent = false) => {
      silent ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const res = await complaintsService.getUserComplaints({
          search_term: debouncedSearch || undefined,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        });
        const statsRes = await complaintsService.getDashboardStats();

        setComplaints(res.complaints);
        setTotal(res.total);
        setStats(statsRes.complaints);
      } catch {
        toast.error("Failed to load complaints");
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
    <div className="min-h-screen -mt-12">
      <Container size="wide">
        <Section>
          <PageHeader
            title="My Complaints"
            subtitle="Track and manage your municipal issues."
            badge={
              <>
                <Badge className="glass text-primary text-xs font-black uppercase border-2 border-primary/20 px-3 py-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Official
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-black uppercase border-2 px-3 py-1.5",
                    isConnected
                      ? "text-secondary border-secondary/30 bg-secondary/10"
                      : "text-destructive border-destructive/30 bg-destructive/10"
                  )}
                >
                  <Wifi className="w-3.5 h-3.5 mr-1.5" />
                  {isConnected ? "Live" : "Offline"}
                </Badge>
              </>
            }
            actions={
              <>
                <Button
                  variant="outline"
                  onClick={() => fetchData(true)}
                  className="stone-card h-11 rounded-xl border-2 font-bold"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4 mr-2",
                      isRefreshing && "animate-spin"
                    )}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() => router.push("/citizen/complaints/new")}
                  className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black elevation-2 px-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Report
                </Button>
              </>
            }
          />

          <Grid cols={4} className="mb-6">
            <RegistryStat
              label="Total"
              value={stats.total}
              icon={FileText}
              colorClass="bg-muted"
            />
            <RegistryStat
              label="Open"
              value={stats.open}
              icon={Clock}
              colorClass="bg-amber-500"
            />
            <RegistryStat
              label="Active"
              value={stats.in_progress}
              icon={Activity}
              colorClass="bg-primary"
            />
            <RegistryStat
              label="Resolved"
              value={stats.resolved}
              icon={CheckCircle}
              colorClass="bg-secondary"
            />
          </Grid>

          <Card className="stone-card border-2 border-border elevation-2">
            <CardHeader className="border-b-2 border-border p-6">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by title, tracking code, or category..."
                  className="h-12 pl-12 pr-12 rounded-xl bg-background border-2 border-border focus:border-primary text-sm font-medium"
                />
                {search && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-accent rounded-lg p-1 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="min-h-[400px] p-6">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="py-24 text-center">
                    <div className="p-6 bg-muted rounded-2xl inline-flex items-center justify-center mb-5 border-2 border-border">
                      <Inbox className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">
                      No Complaints Found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {search
                        ? "Try adjusting your search terms"
                        : "Your submitted complaints will appear here"}
                    </p>
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