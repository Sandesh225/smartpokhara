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

// UI Components
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

// Design System
import {
  Container,
  Section,
  PageHeader,
  Grid,
} from "@/lib/design-system/container";

// Services & Components
import { createClient } from "@/lib/supabase/client";
import { ComplaintsTable } from "@/app/(protected)/citizen/complaints/_components/ComplaintsTable";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  Complaint,
  ComplaintStatus,
} from "@/lib/supabase/queries/complaints";
import { cn } from "@/lib/utils";

// ============================================
// COMPONENT: REGISTRY STATS
// ============================================
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
    <Card className="stone-card elevation-2 hover:elevation-3 transition-all group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </p>
            <h3 className="text-3xl lg:text-4xl font-black tracking-tighter tabular-nums">
              {value}
            </h3>
          </div>
          <div
            className={cn(
              "p-3 rounded-2xl transition-transform group-hover:scale-110 elevation-1",
              colorClass
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN PAGE: COMPLAINTS REGISTRY
// ============================================
export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // --- REFS ---
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- STATE ---
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

  // Sync state with URL params
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [inputValue, setInputValue] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort_by") || "submitted_at"
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    (searchParams.get("sort_order") as any) || "DESC"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const pageSize = 15;

  // ============================================
  // HANDLERS (Bridging UI and URL)
  // ============================================

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val) params.set(key, val);
        else params.delete(key);
      });
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (val: string) => {
    setInputValue(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
      updateParams({ search: val, page: "1" });
    }, 400);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    updateParams({ tab, page: "1" });
  };

  const handleSortChange = (property: string, order: "ASC" | "DESC") => {
    setSortBy(property);
    setSortOrder(order);
    updateParams({ sort_by: property, sort_order: order });
  };

  const clearFilters = () => {
    setInputValue("");
    setDebouncedSearch("");
    setActiveTab("all");
    setCurrentPage(1);
    router.replace("/citizen/complaints");
    toast.success("Registry View Reset");
  };

  // ============================================
  // DATA FETCHING
  // ============================================
  const fetchRegistryData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const statusMap: Record<string, ComplaintStatus[]> = {
          open: ["received", "under_review", "assigned", "reopened"],
          in_progress: ["in_progress"],
          resolved: ["resolved", "closed"],
          pending: ["received", "under_review", "assigned"],
        };

        const [dataRes, statsRes] = await Promise.all([
          complaintsService.getUserComplaints({
            search_term: debouncedSearch || undefined,
            status: statusMap[activeTab] || [],
            sort_by: sortBy as any,
            sort_order: sortOrder,
            limit: pageSize,
            offset: (currentPage - 1) * pageSize,
          }),
          complaintsService.getDashboardStats(),
        ]);

        setComplaints(dataRes.complaints);
        setTotal(dataRes.total);
        setStats(statsRes.complaints);
      } catch (e) {
        toast.error("Failed to sync metropolitan registry");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, debouncedSearch, sortBy, sortOrder, currentPage, pageSize]
  );

  useEffect(() => {
    fetchRegistryData();
  }, [fetchRegistryData]);

  // Real-time listener
  useEffect(() => {
    let channel: any;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`citizen-registry-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "complaints",
            filter: `citizen_id=eq.${user.id}`,
          },
          () => fetchRegistryData(true)
        )
        .subscribe((status) => setIsConnected(status === "SUBSCRIBED"));
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchRegistryData]);

  return (
    <div className="min-h-screen">
      <Container size="wide" spacing="normal">
        <Section spacing="normal">
          <PageHeader
            title="My Complaints"
            subtitle="Manage and track your reported issues in real-time."
            badge={
              <>
                <Badge className="glass border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5">
                  <ShieldCheck className="w-3 h-3 mr-1.5" /> Official Registry
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all",
                    isConnected
                      ? "text-secondary border-secondary/30 bg-secondary/10"
                      : "text-destructive border-destructive/30 animate-pulse"
                  )}
                >
                  <Wifi className="w-3 h-3 mr-1.5" />{" "}
                  {isConnected ? "Live Sync" : "Reconnecting..."}
                </Badge>
              </>
            }
            actions={
              <>
                <Button
                  variant="outline"
                  onClick={() => fetchRegistryData(true)}
                  disabled={isRefreshing}
                  className="h-12 rounded-2xl stone-card font-bold flex-1 lg:flex-none"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4 mr-2",
                      isRefreshing && "animate-spin"
                    )}
                  />{" "}
                  Refresh
                </Button>
                <Button
                  onClick={() => router.push("/citizen/complaints/new")}
                  className="h-12 rounded-2xl bg-primary hover:bg-primary/90 font-black elevation-3 flex-1 lg:flex-none px-8"
                >
                  <Plus className="w-5 h-5 mr-2" /> New Report
                </Button>
              </>
            }
          />

          <Grid cols={4}>
            <RegistryStat
              label="Total Records"
              value={stats.total}
              icon={FileText}
              colorClass="bg-[rgb(var(--text-ink))]"
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

          <Card className="stone-card elevation-4 overflow-hidden">
            <CardHeader className="bg-muted/30 card-padding border-b border-border">
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Filter by title or tracking code..."
                      value={inputValue}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="h-14 pl-12 rounded-2xl border-2 bg-white focus:border-primary transition-all font-medium"
                    />
                    {inputValue && (
                      <button
                        onClick={clearFilters}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-14 rounded-2xl stone-card px-6 font-bold hover:border-primary bg-transparent"
                        >
                          <SlidersHorizontal className="w-4 h-4 mr-2" />{" "}
                          Advanced
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="rounded-l-[3rem] p-10">
                        <SheetHeader>
                          <SheetTitle className="text-3xl font-black">
                            Registry Filter
                          </SheetTitle>
                          <SheetDescription className="text-base">
                            Refine how you view your records.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-10 space-y-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                              Sort By
                            </label>
                            <Select
                              value={sortBy}
                              onValueChange={(v) =>
                                handleSortChange(v, sortOrder)
                              }
                            >
                              <SelectTrigger className="h-14 rounded-2xl border-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                <SelectItem value="submitted_at">
                                  Submission Date
                                </SelectItem>
                                <SelectItem value="priority">
                                  Priority Level
                                </SelectItem>
                                <SelectItem value="sla_due_at">
                                  Response Deadline
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <SheetFooter>
                          <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="w-full h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] bg-transparent"
                          >
                            Reset All
                          </Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                    <p className="hidden lg:block text-xs font-black text-muted-foreground uppercase tracking-widest px-2 tabular-nums">
                      {total} Records
                    </p>
                  </div>
                </div>

                {/* Status Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="bg-muted p-1.5 rounded-[1.5rem] h-auto flex-wrap justify-start gap-1">
                    {["all", "open", "in_progress", "resolved", "pending"].map(
                      (tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:elevation-2 transition-all"
                        >
                          {tab.replace("_", " ")}
                        </TabsTrigger>
                      )
                    )}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="card-padding min-h-[500px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-64 items-center justify-center"
                  >
                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                  </motion.div>
                ) : complaints.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-32 text-center"
                  >
                    <div className="h-20 w-20 bg-muted rounded-[2rem] flex items-center justify-center mb-6 elevation-1">
                      {debouncedSearch ? (
                        <SearchX className="w-10 h-10 text-muted-foreground" />
                      ) : (
                        <Inbox className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-2xl font-black">Registry Empty</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2 font-medium leading-relaxed">
                      {debouncedSearch
                        ? `No records matching "${debouncedSearch}" were found.`
                        : "You haven't submitted any municipal reports yet."}
                    </p>
                    <Button
                      onClick={clearFilters}
                      variant="link"
                      className="mt-4 text-primary font-bold uppercase tracking-widest text-[10px]"
                    >
                      Reset Global Search
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ComplaintsTable
                      complaints={complaints}
                      total={total}
                      isLoading={isLoading}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onSortChange={handleSortChange}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Section>
      </Container>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/citizen/complaints/new")}
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center elevation-5 ring-4 ring-background lg:hidden"
      >
        <Plus className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
        </span>
      </motion.button>
    </div>
  );
}