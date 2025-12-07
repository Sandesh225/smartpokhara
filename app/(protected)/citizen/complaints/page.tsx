// app/(protected)/citizen/complaints/page.tsx - COMPLETE VERSION
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Building,
  Download,
  Eye,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { Complaint, ComplaintWithRelations } from "@/lib/types/complaints";

interface FilterState {
  status: string;
  category: string;
  ward: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export default function ComplaintsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [complaints, setComplaints] = useState<ComplaintWithRelations[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<
    ComplaintWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [wards, setWards] = useState<
    { id: string; ward_number: number; name: string }[]
  >([]);

  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    category: "all",
    ward: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
    setupRealtimeSubscription();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch user complaints
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: complaintsData, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          category:complaint_categories(name),
          subcategory:complaint_subcategories(name),
          ward:wards(ward_number, name),
          department:departments(name),
          assigned_staff:users!complaints_assigned_staff_id_fkey(
            id,
            user_profiles(full_name)
          )
        `
        )
        .eq("citizen_id", userData.user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setComplaints(complaintsData || []);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("complaint_categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      setCategories(categoriesData || []);

      // Fetch wards
      const { data: wardsData } = await supabase
        .from("wards")
        .select("id, ward_number, name")
        .eq("is_active", true)
        .order("ward_number");

      setWards(wardsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel("complaints-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            // Refresh complaints list
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function applyFilters() {
    let filtered = [...complaints];

    // Status filter
    if (filters.status !== "all") {
      const statusMap: Record<string, string[]> = {
        active: [
          "submitted",
          "received",
          "assigned",
          "accepted",
          "in_progress",
        ],
        pending: ["submitted", "received"],
        in_progress: ["assigned", "accepted", "in_progress"],
        resolved: ["resolved", "closed"],
        rejected: ["rejected"],
      };
      filtered = filtered.filter((c) =>
        statusMap[filters.status]?.includes(c.status)
      );
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((c) => c.category_id === filters.category);
    }

    // Ward filter
    if (filters.ward !== "all") {
      filtered = filtered.filter((c) => c.ward_id === filters.ward);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((c) => new Date(c.submitted_at) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter((c) => new Date(c.submitted_at) <= toDate);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.tracking_code.toLowerCase().includes(searchLower) ||
          c.title.toLowerCase().includes(searchLower)
      );
    }

    setFilteredComplaints(filtered);
  }

  async function handleExportCSV() {
    try {
      setExporting(true);

      const headers = [
        "Tracking Code",
        "Title",
        "Category",
        "Ward",
        "Status",
        "Priority",
        "Submitted Date",
        "Last Updated",
        "SLA Due",
        "Resolution Date",
      ];

      const rows = filteredComplaints.map((c) => [
        c.tracking_code,
        c.title,
        c.category?.name || "",
        `Ward ${c.ward?.ward_number}`,
        getStatusLabel(c.status),
        c.priority,
        format(new Date(c.submitted_at), "yyyy-MM-dd HH:mm"),
        format(new Date(c.updated_at), "yyyy-MM-dd HH:mm"),
        c.sla_due_at ? format(new Date(c.sla_due_at), "yyyy-MM-dd") : "",
        c.resolved_at ? format(new Date(c.resolved_at), "yyyy-MM-dd") : "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `complaints_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Complaints exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export complaints");
    } finally {
      setExporting(false);
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      draft: "Draft",
      submitted: "Submitted",
      received: "Received",
      assigned: "Assigned",
      accepted: "Accepted",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      rejected: "Rejected",
      reopened: "Reopened",
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      received: "bg-blue-100 text-blue-800",
      assigned: "bg-indigo-100 text-indigo-800",
      accepted: "bg-indigo-100 text-indigo-800",
      in_progress: "bg-amber-100 text-amber-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      reopened: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  function getPriorityColor(priority: string) {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
      critical: "bg-purple-100 text-purple-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) =>
      ["submitted", "received"].includes(c.status)
    ).length,
    inProgress: complaints.filter((c) =>
      ["assigned", "accepted", "in_progress"].includes(c.status)
    ).length,
    resolved: complaints.filter((c) =>
      ["resolved", "closed"].includes(c.status)
    ).length,
    overdue: complaints.filter(
      (c) =>
        c.sla_due_at &&
        new Date(c.sla_due_at) < new Date() &&
        !["resolved", "closed", "rejected"].includes(c.status)
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Complaints</h1>
          <p className="text-muted-foreground">
            Track and manage all your submitted complaints
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={exporting || filteredComplaints.length === 0}
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Link href="/citizen/complaints/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.inProgress}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdue}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter your complaints by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters({ ...filters, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ward</label>
              <Select
                value={filters.ward}
                onValueChange={(value) =>
                  setFilters({ ...filters, ward: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      Ward {ward.ward_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by ID or title"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                All Complaints ({filteredComplaints.length})
              </CardTitle>
              <CardDescription>
                Showing {filteredComplaints.length} of {complaints.length}{" "}
                complaints
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No complaints found</h3>
              <p className="text-muted-foreground mb-6">
                {filters.status !== "all" ||
                filters.category !== "all" ||
                filters.ward !== "all" ||
                filters.search
                  ? "No complaints match your filters."
                  : "You haven't submitted any complaints yet."}
              </p>
              {filters.status !== "all" ||
              filters.category !== "all" ||
              filters.ward !== "all" ||
              filters.search ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      status: "all",
                      category: "all",
                      ward: "all",
                      dateFrom: "",
                      dateTo: "",
                      search: "",
                    })
                  }
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/citizen/complaints/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Your First Complaint
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>SLA Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => {
                    const isOverdue =
                      complaint.sla_due_at &&
                      new Date(complaint.sla_due_at) < new Date() &&
                      !["resolved", "closed", "rejected"].includes(
                        complaint.status
                      );

                    return (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {complaint.tracking_code}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {complaint.title}
                          </div>
                        </TableCell>
                        <TableCell>{complaint.category?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(complaint.status)}>
                              {getStatusLabel(complaint.status)}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPriorityColor(complaint.priority)}
                          >
                            {complaint.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Ward {complaint.ward?.ward_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(
                              new Date(complaint.submitted_at),
                              {
                                addSuffix: true,
                              }
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {complaint.sla_due_at ? (
                              <span
                                className={
                                  isOverdue ? "text-red-600 font-medium" : ""
                                }
                              >
                                {formatDistanceToNow(
                                  new Date(complaint.sla_due_at),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            ) : (
                              "Not set"
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/citizen/complaints/${complaint.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {["resolved", "closed"].includes(
                              complaint.status
                            ) &&
                              !complaint.citizen_satisfaction_rating && (
                                <Link
                                  href={`/citizen/complaints/${complaint.id}/feedback`}
                                >
                                  <Button variant="outline" size="sm">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
