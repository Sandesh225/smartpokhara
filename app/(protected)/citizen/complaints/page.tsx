"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { ComplaintsTable } from "@/components/citizen/complaints/ComplaintsTable";
// Filter components and types are removed:
// import { ComplaintFilters, type FilterState } from "@/components/citizen/complaints/ComplaintFilters";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  Complaint,
  ComplaintStatus,
  // ComplaintPriority, // Not needed
} from "@/lib/supabase/queries/complaints";

// Local UI Component: Stat Card
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

export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Filter-related states removed:
  // const [categories, setCategories] = useState<any[]>([]);
  // const [wards, setWards] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const [searchTerm, setSearchTerm] = useState("");
  // Filters state simplified to only search term
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState<
    "submitted_at" | "priority" | "sla_due_at"
  >("submitted_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Categories and Wards fetching logic removed

    // Stats fetching kept
    (async () => {
      try {
        const s = await complaintsService.getDashboardStats();
        setStats(s.complaints);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Filter reading logic simplified
    const search = params.get("search") || "";

    setCurrentSearchTerm(search);
    setSearchTerm(search);

    setCurrentPage(Number.parseInt(params.get("page") || "1") || 1);

    if (params.get("sort_by")) setSortBy(params.get("sort_by") as any);
    if (params.get("sort_order"))
      setSortOrder(params.get("sort_order") as "ASC" | "DESC");
    if (params.get("tab")) setActiveTab(params.get("tab")!);
  }, [searchParams]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await complaintsService.getDashboardStats();
      setStats(s.complaints);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
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

      // Filter state is now combined status OR empty array if no tab is selected
      const combinedStatus = activeTab === "all" ? [] : statusFilter;

      const result = await complaintsService.getUserComplaints({
        search_term: currentSearchTerm || undefined,
        status: combinedStatus,
        priority: [], // Removed priority filter
        category_id: undefined, // Removed category filter
        ward_id: undefined, // Removed ward filter
        date_from: undefined, // Removed date filter
        date_to: undefined, // Removed date filter
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      setComplaints(result.complaints);
      setTotalComplaints(result.total);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load complaints", {
        description: error.message || "Try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, currentSearchTerm, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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
            fetchComplaints();
            fetchStats();
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchComplaints, fetchStats, supabase]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentSearchTerm(value); // Update current search term for fetch

    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");

    params.set("page", "1");
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };

  // handleFilterChange logic removed

  const handleSortChange = (
    newSortBy: string,
    newSortOrder: "ASC" | "DESC"
  ) => {
    setSortBy(newSortBy as any);
    setSortOrder(newSortOrder);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort_by", newSortBy);
    params.set("sort_order", newSortOrder);
    router.replace(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleClearSearch = () => {
    handleSearch(""); // Clear the search term
    handleTabChange("all"); // Reset tab to "all"
    const params = new URLSearchParams();
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleRefresh = () => {
    fetchComplaints();
    fetchStats();
    toast.success("Complaints list refreshed");
  };

  // hasActiveFilters logic simplified
  const hasActiveSearch = searchTerm.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                My Complaints
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                Track, manage, and monitor all your submitted complaints in one
                place
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2 border-slate-300 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all duration-200 shadow-sm"
                aria-label="Refresh complaints list"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                onClick={() => router.push("/citizen/complaints/new")}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                aria-label="Create new complaint"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Complaint</span>
                <span className="sm:hidden">New</span>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <Card className="border-slate-200/60 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 opacity-40 pointer-events-none" />
              <CardHeader className="relative pb-6 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-sm border-b border-slate-200/60">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 w-full sm:max-w-md">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input
                        placeholder="Search by tracking code or title..."
                        className="pl-12 pr-4 h-12 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all duration-200 text-base"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        aria-label="Search complaints"
                      />
                    </div>

                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 shadow-md text-sm font-medium whitespace-nowrap">
                      {totalComplaints}{" "}
                      {totalComplaints === 1 ? "complaint" : "complaints"}
                    </Badge>
                  </div>

                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange} // Changed from setActiveTab to handleTabChange
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-5 w-full bg-white/80 backdrop-blur-sm border border-slate-200 p-1 h-auto shadow-sm">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 text-sm font-medium"
                      >
                        <span className="hidden sm:inline">All</span>
                        <span className="sm:hidden">All</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="open"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                      >
                        <AlertCircle className="h-4 w-4 hidden sm:block" />
                        <span className="hidden md:inline">Open</span>
                        <span className="md:hidden">Open</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="in_progress"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                      >
                        <Clock className="h-4 w-4 hidden sm:block" />
                        <span className="hidden lg:inline">In Progress</span>
                        <span className="lg:hidden">Progress</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="resolved"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4 hidden sm:block" />
                        <span className="hidden md:inline">Resolved</span>
                        <span className="md:hidden">Done</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-2.5 gap-1.5 text-sm font-medium"
                      >
                        <Bell className="h-4 w-4 hidden sm:block" />
                        <span className="hidden md:inline">Pending</span>
                        <span className="md:hidden">Pend</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent className="pt-6 relative">
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
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
