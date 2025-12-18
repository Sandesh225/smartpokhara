"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  RefreshCw,
  Search,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  X,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"; // Assuming you have this or similar
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming you have this

import { createClient } from "@/lib/supabase/client";
import { ComplaintsTable } from "@/components/citizen/complaints/ComplaintsTable";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  Complaint,
  ComplaintStatus,
} from "@/lib/supabase/queries/complaints";

// ============================================
// TYPES & UTILS
// ============================================
type SortOption = "submitted_at" | "priority" | "sla_due_at";

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  iconBg,
}: {
  icon: any;
  label: string;
  value: number;
  gradient: string;
  iconBg: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 opacity-5 ${gradient}`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {value.toLocaleString()}
            </p>
          </div>
          <div
            className={`${iconBg} h-12 w-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// INTELLIGENT EMPTY STATE COMPONENT
// ============================================
function EmptyState({
  hasSearch,
  activeTab,
  searchTerm,
  onClearFilters,
  onNewComplaint,
}: {
  hasSearch: boolean;
  activeTab: string;
  searchTerm: string;
  onClearFilters: () => void;
  onNewComplaint: () => void;
}) {
  // Determine the reason for empty state
  const getEmptyStateContent = () => {
    if (hasSearch) {
      return {
        title: `No results for "${searchTerm}"`,
        description:
          "Try adjusting your search terms or clearing filters to see more complaints.",
        icon: Search,
        action: {
          label: "Clear search",
          onClick: onClearFilters,
        },
      };
    }

    switch (activeTab) {
      case "resolved":
        return {
          title: "No resolved complaints yet",
          description: "Once your complaints are resolved, they'll appear here.",
          icon: CheckCircle,
          action: {
            label: "View all complaints",
            onClick: onClearFilters,
          },
        };
      case "in_progress":
        return {
          title: "No complaints in progress",
          description: "Complaints being actively worked on will show here.",
          icon: Activity,
          action: {
            label: "View all complaints",
            onClick: onClearFilters,
          },
        };
      case "pending":
        return {
          title: "No pending complaints",
          description: "New complaints awaiting review will appear here.",
          icon: Clock,
          action: {
            label: "Submit new complaint",
            onClick: onNewComplaint,
          },
        };
      case "open":
        return {
          title: "No open complaints",
          description: "All your complaints have been resolved or closed.",
          icon: AlertCircle,
          action: {
            label: "Submit new complaint",
            onClick: onNewComplaint,
          },
        };
      default:
        return {
          title: "No complaints found",
          description:
            "Get started by submitting your first complaint to the municipality.",
          icon: FileText,
          action: {
            label: "Submit new complaint",
            onClick: onNewComplaint,
          },
        };
    }
  };

  const content = getEmptyStateContent();
  const IconComponent = content.icon;

  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center mb-5 shadow-sm">
        <IconComponent className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{content.title}</h3>
      <p className="text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
        {content.description}
      </p>
      <Button
        onClick={content.action.onClick}
        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
      >
        {content.action.label}
      </Button>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Browser-safe timer type
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Search State
  const [inputValue, setInputValue] = useState(""); // Immediate input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // API value

  const [sortBy, setSortBy] = useState<SortOption>("submitted_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [activeTab, setActiveTab] = useState("all");

  // ============================================
  // STATS FETCHING
  // ============================================
  const fetchStats = useCallback(async () => {
    try {
      const s = await complaintsService.getDashboardStats();
      setStats(s.complaints);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  }, []);

  // ============================================
  // URL PARAMS SYNC
  // ============================================
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const search = params.get("search") || "";
    
    // Only update if mounting or external navigation changed it
    if (search !== inputValue) {
      setInputValue(search);
      setDebouncedSearchTerm(search);
    }

    setCurrentPage(Number.parseInt(params.get("page") || "1") || 1);

    if (params.get("sort_by")) setSortBy(params.get("sort_by") as SortOption);
    if (params.get("sort_order"))
      setSortOrder(params.get("sort_order") as "ASC" | "DESC");
    if (params.get("tab")) setActiveTab(params.get("tab")!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Exclude inputValue to prevent loop

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ============================================
  // COMPLAINTS FETCHING
  // ============================================
  const fetchComplaints = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      let statusFilter: ComplaintStatus[] = [];

      if (activeTab === "open") {
        statusFilter = [
          "received",
          "under_review",
          "assigned",
          "in_progress",
          "reopened",
        ];
      } else if (activeTab === "in_progress") {
        statusFilter = ["in_progress"];
      } else if (activeTab === "resolved") {
        statusFilter = ["resolved", "closed"];
      } else if (activeTab === "pending") {
        statusFilter = ["received", "under_review", "assigned"];
      }

      const combinedStatus = activeTab === "all" ? [] : statusFilter;

      const result = await complaintsService.getUserComplaints({
        search_term: debouncedSearchTerm || undefined,
        status: combinedStatus,
        priority: [],
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      setComplaints(result.complaints);
      setTotalComplaints(result.total);
    } catch (error: any) {
      console.error("Failed to fetch complaints:", error);
      if (!isBackgroundRefresh) {
        toast.error("Failed to load complaints");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, currentPage, debouncedSearchTerm, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================
  useEffect(() => {
    let channel: any;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      channel = supabase
        .channel(`citizen-complaints-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "complaints",
            filter: `citizen_id=eq.${user.id}`,
          },
          () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
            // Debounce the refresh
            refreshTimerRef.current = setTimeout(() => {
              fetchComplaints(true); // Quiet refresh
              fetchStats();
            }, 1000);
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [fetchComplaints, fetchStats, supabase]);

  // ============================================
  // HANDLERS
  // ============================================
  
  // Debounced Search Handler
  const handleSearchInput = (value: string) => {
    setInputValue(value);
    
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1);
      
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      params.set("page", "1");
      
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 500); // 500ms debounce
  };

  const handleClearSearch = () => {
    setInputValue("");
    setDebouncedSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.replace(`?${params.toString()}`);
  };

  const handleSortChange = (
    newSortBy: string,
    newSortOrder: "ASC" | "DESC"
  ) => {
    setSortBy(newSortBy as SortOption);
    setSortOrder(newSortOrder);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort_by", newSortBy);
    params.set("sort_order", newSortOrder);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setInputValue("");
    setDebouncedSearchTerm("");
    setActiveTab("all");
    setCurrentPage(1);

    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("tab", "all");
    router.replace(`?${params.toString()}`);
    toast.success("Filters cleared");
  };

  const handleRefresh = () => {
    fetchComplaints();
    fetchStats();
    toast.success("Complaints list refreshed");
  };

  const handleNewComplaint = () => {
    router.push("/citizen/complaints/new");
  };

  const hasActiveFilters = debouncedSearchTerm.length > 0 || activeTab !== "all";

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-20 sm:pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                My Complaints
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                Track, manage, and monitor all your submitted complaints in one place
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="gap-2 border-slate-300 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all duration-200 shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                onClick={handleNewComplaint}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white hidden sm:flex"
              >
                <Plus className="h-4 w-4" />
                <span>New Complaint</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={FileText}
              label="Total Complaints"
              value={stats.total}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={AlertCircle}
              label="Open"
              value={stats.open}
              gradient="bg-gradient-to-br from-orange-500 to-orange-600"
              iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
            />
            <StatCard
              icon={Activity}
              label="In Progress"
              value={stats.in_progress}
              gradient="bg-gradient-to-br from-amber-500 to-amber-600"
              iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
            />
            <StatCard
              icon={CheckCircle}
              label="Resolved"
              value={stats.resolved}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <main className="lg:col-span-12">
            <Card className="border-slate-200/60 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 opacity-40 pointer-events-none" />

              <CardHeader className="relative pb-6 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-sm border-b border-slate-200/60">
                <div className="space-y-6">
                  {/* Search Bar & Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 w-full sm:max-w-md">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input
                        placeholder="Search by tracking code or title..."
                        className="pl-12 pr-10 h-12 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all duration-200 text-base"
                        value={inputValue}
                        onChange={(e) => handleSearchInput(e.target.value)}
                      />
                      {inputValue && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                          onClick={handleClearSearch}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Mobile Filter Sheet */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" className="sm:hidden flex-1 gap-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Filter & Sort</SheetTitle>
                            <SheetDescription>
                              Refine your complaints list
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-6 space-y-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Sort By</label>
                              <Select
                                value={sortBy}
                                onValueChange={(val) => handleSortChange(val, sortOrder)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="submitted_at">Date Submitted</SelectItem>
                                  <SelectItem value="priority">Priority</SelectItem>
                                  <SelectItem value="sla_due_at">SLA Due Date</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Order</label>
                              <div className="flex gap-2">
                                <Button 
                                  variant={sortOrder === "DESC" ? "default" : "outline"} 
                                  onClick={() => handleSortChange(sortBy, "DESC")}
                                  className="flex-1"
                                >
                                  Newest First
                                </Button>
                                <Button 
                                  variant={sortOrder === "ASC" ? "default" : "outline"}
                                  onClick={() => handleSortChange(sortBy, "ASC")}
                                  className="flex-1"
                                >
                                  Oldest First
                                </Button>
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                             <SheetClose asChild>
                               <Button onClick={handleClearFilters} variant="ghost" className="w-full">
                                 Clear All Filters
                               </Button>
                             </SheetClose>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>

                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="gap-2 text-slate-600 hover:text-slate-900 border-slate-300 hidden sm:flex"
                        >
                          <Filter className="h-4 w-4" />
                          Clear filters
                        </Button>
                      )}

                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 shadow-md text-sm font-medium whitespace-nowrap hidden sm:inline-flex">
                        {totalComplaints}{" "}
                        {totalComplaints === 1 ? "complaint" : "complaints"}
                      </Badge>
                    </div>
                  </div>

                  {/* Scrollable Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <div className="overflow-x-auto pb-2 -mb-2">
                      <TabsList className="inline-flex w-full sm:w-auto min-w-full bg-white/80 backdrop-blur-sm border border-slate-200 p-1 h-auto shadow-sm">
                        <TabsTrigger
                          value="all"
                          className="flex-1 min-w-[80px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 text-sm font-medium"
                        >
                          All
                        </TabsTrigger>
                        <TabsTrigger
                          value="open"
                          className="flex-1 min-w-[100px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                        >
                          <AlertCircle className="h-4 w-4 hidden sm:block" />
                          Open
                        </TabsTrigger>
                        <TabsTrigger
                          value="in_progress"
                          className="flex-1 min-w-[120px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                        >
                          <Clock className="h-4 w-4 hidden sm:block" />
                          In Progress
                        </TabsTrigger>
                        <TabsTrigger
                          value="resolved"
                          className="flex-1 min-w-[110px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                        >
                          <CheckCircle className="h-4 w-4 hidden sm:block" />
                          Resolved
                        </TabsTrigger>
                        <TabsTrigger
                          value="pending"
                          className="flex-1 min-w-[100px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                        >
                          <Bell className="h-4 w-4 hidden sm:block" />
                          Pending
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent className="pt-6 relative min-h-[400px]">
                {!isLoading && complaints.length === 0 ? (
                  <EmptyState
                    hasSearch={debouncedSearchTerm.length > 0}
                    activeTab={activeTab}
                    searchTerm={debouncedSearchTerm}
                    onClearFilters={handleClearFilters}
                    onNewComplaint={handleNewComplaint}
                  />
                ) : (
                  <ComplaintsTable
                    complaints={complaints}
                    total={totalComplaints}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onSortChange={handleSortChange}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <Button
          onClick={handleNewComplaint}
          size="icon"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}