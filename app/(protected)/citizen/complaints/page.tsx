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
  SlidersHorizontal,
  ShieldCheck,
  Wifi,
  SearchX,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Card className="stone-card elevation-2 transition-all hover:elevation-3">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </p>
            <h3 className="mt-2 text-4xl font-black tabular-nums">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-2xl elevation-1", colorClass)}>
            <Icon className="w-5 h-5 text-primary-foreground" />
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
    <div className="min-h-screen bg-background">
      <Container size="wide">
        <Section>
          <PageHeader
            title="My Complaints"
            subtitle="Track and manage your municipal issues."
            badge={
              <>
                <Badge className="glass text-primary text-[10px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Official
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-black uppercase",
                    isConnected
                      ? "text-secondary border-secondary"
                      : "text-destructive border-destructive"
                  )}
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  {isConnected ? "Live" : "Offline"}
                </Badge>
              </>
            }
            actions={
              <>
                <Button
                  variant="outline"
                  onClick={() => fetchData(true)}
                  className="stone-card h-12 rounded-2xl"
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
                  className="h-12 rounded-2xl bg-primary text-primary-foreground font-black elevation-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Report
                </Button>
              </>
            }
          />

          <Grid cols={4}>
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
              colorClass="bg-[rgb(var(--warning-amber))]"
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

          <Card className="stone-card mt-8">
            <CardHeader className="border-b border-border">
              <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search complaints..."
                  className="h-14 pl-12 rounded-2xl bg-card border-border"
                />
                {search && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="py-24 text-center">
                    <Inbox className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
                    <h3 className="text-xl font-black">No Complaints Found</h3>
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
