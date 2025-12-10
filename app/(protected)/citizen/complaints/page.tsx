// app/citizen/complaints/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";

import { Input } from "@/ui/input";

import { Separator } from "@/ui//separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { Badge } from "@/ui/badge";

import {
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  BarChart3,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { ComplaintsTable } from "@/components/citizen/complaints/ComplaintsTable";
import {
  ComplaintFilters,
  type FilterState,
} from "@/components/citizen/complaints/ComplaintFilters";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
} from "@/lib/supabase/queries/complaints";

export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    priority: [],
    category_id: null,
    ward_id: null,
    date_from: null,
    date_to: null,
  });
  const [sortBy, setSortBy] = useState<
    "submitted_at" | "priority" | "sla_due_at"
  >("submitted_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch initial data
  useEffect(() => {
    fetchCategoriesAndWards();
    fetchStats();
  }, []);

  // Fetch complaints when filters/pagination/sort changes
  useEffect(() => {
    fetchComplaints();
  }, [currentPage, filters, sortBy, sortOrder, activeTab]);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const newFilters: FilterState = {
      search: params.get("search") || "",
      status:
        (params
          .get("status")
          ?.split(",")
          .filter(Boolean) as ComplaintStatus[]) || [],
      priority:
        (params
          .get("priority")
          ?.split(",")
          .filter(Boolean) as ComplaintPriority[]) || [],
      category_id: params.get("category") || null,
      ward_id: params.get("ward") || null,
      date_from: params.get("date_from")
        ? new Date(params.get("date_from")!)
        : null,
      date_to: params.get("date_to") ? new Date(params.get("date_to")!) : null,
    };

    setFilters(newFilters);
    setSearchTerm(newFilters.search);

    if (params.get("page")) {
      setCurrentPage(parseInt(params.get("page")!) || 1);
    }

    if (params.get("sort_by")) {
      setSortBy(params.get("sort_by") as any);
    }

    if (params.get("sort_order")) {
      setSortOrder(params.get("sort_order") as "ASC" | "DESC");
    }

    if (params.get("tab")) {
      setActiveTab(params.get("tab")!);
    }
  }, [searchParams]);

  const fetchCategoriesAndWards = async () => {
    try {
      const [cats, wds] = await Promise.all([
        complaintsService.getCategories(),
        complaintsService.getWards(),
      ]);
      setCategories(cats);
      setWards(wds);
    } catch (error) {
      console.error("Error fetching categories and wards:", error);
      toast.error("Failed to load filter options");
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await complaintsService.getDashboardStats();
      setStats(stats.complaints);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      // Prepare query params based on active tab
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
        statusFilter = ["in_progress", "assigned"];
      } else if (activeTab === "resolved") {
        statusFilter = ["resolved", "closed"];
      } else if (activeTab === "pending") {
        statusFilter = ["received", "under_review", "assigned"];
      }

      // Combine tab filters with manual filters
      const combinedStatus =
        filters.status.length > 0 ? filters.status : statusFilter;

      const params = {
        status: combinedStatus,
        priority: filters.priority,
        category_id: filters.category_id || undefined,
        ward_id: filters.ward_id || undefined,
        date_from: filters.date_from?.toISOString(),
        date_to: filters.date_to?.toISOString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      };

      const result = await complaintsService.getUserComplaints(params);

      setComplaints(result.complaints);
      setTotalComplaints(result.total);
    } catch (error: any) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, sortBy, sortOrder, activeTab, pageSize]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.replace(`?${params.toString()}`);

    // Update filters with debounce
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);

    // Update URL params
    const params = new URLSearchParams();

    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.status.length > 0)
      params.set("status", newFilters.status.join(","));
    if (newFilters.priority.length > 0)
      params.set("priority", newFilters.priority.join(","));
    if (newFilters.category_id) params.set("category", newFilters.category_id);
    if (newFilters.ward_id) params.set("ward", newFilters.ward_id);
    if (newFilters.date_from)
      params.set("date_from", newFilters.date_from.toISOString());
    if (newFilters.date_to)
      params.set("date_to", newFilters.date_to.toISOString());

    router.replace(`?${params.toString()}`);
  };

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

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: [],
      priority: [],
      category_id: null,
      ward_id: null,
      date_from: null,
      date_to: null,
    });
    setSearchTerm("");
    setActiveTab("all");
    setCurrentPage(1);
    router.replace("/citizen/complaints");
  };

  const handleExportCSV = async () => {
    try {
      setIsLoading(true);
      toast.info("Preparing CSV export...");

      // Fetch all complaints without pagination for export
      const allComplaints = await complaintsService.searchComplaints({
        status: filters.status.length > 0 ? filters.status : undefined,
        priority: filters.priority.length > 0 ? filters.priority : undefined,
        category_id: filters.category_id || undefined,
        ward_id: filters.ward_id || undefined,
        date_from: filters.date_from?.toISOString(),
        date_to: filters.date_to?.toISOString(),
        limit: 1000,
        offset: 0,
      });

      // Convert to CSV
      const headers = [
        "Tracking Code",
        "Title",
        "Category",
        "Subcategory",
        "Ward",
        "Status",
        "Priority",
        "Submitted Date",
        "Last Updated",
        "SLA Due Date",
        "Description",
      ];

      const rows = allComplaints.complaints.map((complaint) => [
        complaint.tracking_code,
        complaint.title,
        complaint.category_name,
        complaint.subcategory_name || "",
        `Ward ${complaint.ward_number}`,
        complaint.status,
        complaint.priority,
        new Date(complaint.submitted_at).toLocaleDateString(),
        new Date(complaint.updated_at).toLocaleDateString(),
        complaint.sla_due_at
          ? new Date(complaint.sla_due_at).toLocaleDateString()
          : "",
        complaint.description.replace(/"/g, '""').replace(/\n/g, " "),
      ]);

      const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `complaints_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully");
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchComplaints();
    fetchStats();
    toast.success("Complaints list refreshed");
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = complaintsService.subscribeToComplaint("*", (payload) => {
      console.log("Real-time update:", payload);
      // Refresh data when complaint changes
      fetchComplaints();
      fetchStats();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchComplaints]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Complaints</h1>
            <p className="text-slate-600 mt-2">
              Track and manage all your submitted complaints
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              onClick={() => router.push("/citizen/complaints/new")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Complaint
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200 hover:border-blue-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Complaints
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-amber-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Open</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.open}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-purple-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.in_progress}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-green-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Resolved</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.resolved}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter your complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintFilters
                statuses={[
                  "received",
                  "under_review",
                  "assigned",
                  "in_progress",
                  "resolved",
                  "closed",
                  "rejected",
                  "reopened",
                ]}
                priorities={["critical", "urgent", "high", "medium", "low"]}
                categories={categories}
                wards={wards}
                onFilterChange={handleFilterChange}
              />

              <Separator className="my-4" />

              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Quick Actions</h4>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportCSV}
                  disabled={isLoading || complaints.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleClearFilters}
                  disabled={
                    !searchTerm &&
                    !filters.status.length &&
                    !filters.priority.length &&
                    !filters.category_id &&
                    !filters.ward_id
                  }
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        <div className="lg:col-span-3">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search by tracking code or title..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {totalComplaints} complaint
                    {totalComplaints !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-4"
              >
                <TabsList className="grid grid-cols-5 lg:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="open">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Open
                  </TabsTrigger>
                  <TabsTrigger value="in_progress">
                    <Clock className="h-4 w-4 mr-2" />
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger value="resolved">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolved
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    <Bell className="h-4 w-4 mr-2" />
                    Pending
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              <ComplaintsTable
                complaints={complaints}
                total={totalComplaints}
                isLoading={isLoading}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                onRowClick={(complaint) =>
                  router.push(`/citizen/complaints/${complaint.id}`)
                }
              />
            </CardContent>
          </Card>

          {/* Empty State Guidance */}
          {complaints.length === 0 && !isLoading && (
            <Card className="border-slate-200 mt-6">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No complaints found
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-6">
                    {filters.search ||
                    filters.status.length > 0 ||
                    filters.category_id ||
                    filters.ward_id
                      ? "Try adjusting your filters or search term"
                      : "You haven't submitted any complaints yet"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => router.push("/citizen/complaints/new")}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Submit New Complaint
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
