"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, RefreshCw, Search, Bell, AlertCircle, 
  CheckCircle, Clock, FileText, Activity, X, 
  Filter, SlidersHorizontal, ArrowRight, ShieldCheck, 
  Wifi, SearchX, Inbox
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, 
  SheetTitle, SheetTrigger, SheetFooter, SheetClose 
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

// Services & Components
import { createClient } from "@/lib/supabase/client";
import { ComplaintsTable } from "@/components/citizen/complaints/ComplaintsTable";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type { Complaint, ComplaintStatus } from "@/lib/supabase/queries/complaints";
import { cn } from "@/lib/utils";

// ============================================
// COMPONENT: REGISTRY STATS
// ============================================
function RegistryStat({ label, value, icon: Icon, colorClass }: any) {
  return (
    <Card className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm", colorClass)}>
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
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });

  // Sync state with URL params
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "submitted_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">((searchParams.get("sort_order") as any) || "DESC");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const pageSize = 15;

  // ============================================
  // HANDLERS (Bridging UI and URL)
  // ============================================
  
  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

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
  const fetchRegistryData = useCallback(async (isSilent = false) => {
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
        complaintsService.getDashboardStats()
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
  }, [activeTab, debouncedSearch, sortBy, sortOrder, currentPage, pageSize]);

  useEffect(() => { fetchRegistryData(); }, [fetchRegistryData]);

  // Real-time listener
  useEffect(() => {
    let channel: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`citizen-registry-${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `citizen_id=eq.${user.id}` }, 
          () => fetchRegistryData(true)
        )
        .subscribe((status) => setIsConnected(status === "SUBSCRIBED"));
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [supabase, fetchRegistryData]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl space-y-10 pb-24">
        
        {/* --- PAGE HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-blue-600/10 text-blue-700 text-[10px] font-black border-blue-200 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 mr-1" /> Official Registry
              </Badge>
              <Badge variant="outline" className={cn(
                "px-3 font-bold text-[10px] uppercase tracking-wider transition-all",
                isConnected ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-red-600 border-red-200 animate-pulse"
              )}>
                <Wifi className="w-3 h-3 mr-1.5" /> {isConnected ? "Live Sync" : "Reconnecting..."}
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              My Complaints
            </h1>
            <p className="text-slate-500 font-medium text-lg">Manage and track your reported issues in real-time.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={() => fetchRegistryData(true)} className="h-12 rounded-2xl border-2 bg-white flex-1 md:flex-none">
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} /> Refresh
            </Button>
            <Button onClick={() => router.push("/citizen/complaints/new")} className="h-12 rounded-2xl bg-blue-600 font-black shadow-lg shadow-blue-200 flex-1 md:flex-none px-8 text-white">
              <Plus className="w-5 h-5 mr-2" /> New Report
            </Button>
          </div>
        </header>

        {/* --- QUICK STATS --- */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <RegistryStat label="Total Records" value={stats.total} icon={FileText} colorClass="bg-slate-900" />
          <RegistryStat label="Open" value={stats.open} icon={Clock} colorClass="bg-amber-500" />
          <RegistryStat label="Active" value={stats.in_progress} icon={Activity} colorClass="bg-blue-600" />
          <RegistryStat label="Resolved" value={stats.resolved} icon={CheckCircle} colorClass="bg-emerald-600" />
        </section>

        {/* --- REGISTRY CONSOLE --- */}
        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
            <div className="space-y-6">
              {/* Search & Advanced Filters */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="Filter by title or tracking code..."
                    value={inputValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="h-14 pl-12 rounded-2xl border-2 border-slate-100 bg-white focus:border-blue-600 transition-all font-medium"
                  />
                  {inputValue && (
                    <button onClick={clearFilters} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-14 rounded-2xl border-2 border-slate-100 px-6 font-bold text-slate-600 hover:bg-white hover:border-blue-600">
                        <SlidersHorizontal className="w-4 h-4 mr-2" /> Advanced
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="rounded-l-[3rem] p-10">
                      <SheetHeader>
                        <SheetTitle className="text-3xl font-black">Registry Filter</SheetTitle>
                        <SheetDescription className="text-lg">Refine how you view your records.</SheetDescription>
                      </SheetHeader>
                      <div className="py-10 space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sort By</label>
                          <Select value={sortBy} onValueChange={(v) => handleSortChange(v, sortOrder)}>
                            <SelectTrigger className="h-14 rounded-2xl border-2"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="submitted_at">Submission Date</SelectItem>
                              <SelectItem value="priority">Priority Level</SelectItem>
                              <SelectItem value="sla_due_at">Response Deadline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <SheetFooter>
                        <Button onClick={clearFilters} variant="outline" className="w-full h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px]">Reset All</Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                  <p className="hidden lg:block text-xs font-black text-slate-400 uppercase tracking-widest px-2">{total} Records</p>
                </div>
              </div>

              {/* Status Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-[1.5rem] h-auto flex-wrap justify-start gap-1">
                  {["all", "open", "in_progress", "resolved", "pending"].map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab} 
                      className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all"
                    >
                      {tab.replace('_', ' ')}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent className="p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 items-center justify-center">
                   <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                </motion.div>
              ) : complaints.length === 0 ? (
                <motion.div 
                  key="empty" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100">
                    {debouncedSearch ? <SearchX className="w-10 h-10 text-slate-300" /> : <Inbox className="w-10 h-10 text-slate-300" />}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Registry Empty</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium leading-relaxed">
                    {debouncedSearch ? `No records matching "${debouncedSearch}" were found.` : "You haven't submitted any municipal reports yet."}
                  </p>
                  <Button onClick={clearFilters} variant="link" className="mt-4 text-blue-600 font-bold uppercase tracking-widest text-[10px]">
                    Reset Global Search
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
      </div>

      {/* --- MOBILE FAB --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/citizen/complaints/new")}
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-400 ring-4 ring-white md:hidden"
      >
        <Plus className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
        </span>
      </motion.button>
    </div>
  );
}

// Loading Skeleton is handled inside the Table component