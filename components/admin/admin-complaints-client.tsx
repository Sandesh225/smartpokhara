// components/admin/admin-complaints-client.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckSquare,
  Square,
  Users as UsersIcon,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  MoreHorizontal,
  ChevronDown,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComplaintStatusBadge } from "@/components/admin/complaint-status-badge";
import { ComplaintPriorityBadge } from "@/components/admin/complaint-priority-badge";
import type {
  Category,
  Ward,
  Department,
  UserSummary,
  ComplaintListItem,
} from "@/lib/types/complaints";
import type { ComplaintFilters, FilterCounts } from "@/lib/types/admin";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-service";

interface AdminComplaintsClientProps {
  categories: Category[];
  departments: Department[];
  wards: Ward[];
  staffUsers: UserSummary[];
}

interface FilterCountsData {
  status: string;
  count: number;
  priority?: string;
  category_name?: string;
  department_name?: string;
  ward_number?: number;
}

export function AdminComplaintsClient({
  categories,
  departments,
  wards,
  staffUsers,
}: AdminComplaintsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    status: [],
    priority: [],
    categories: [],
    departments: [],
    wards: [],
  });

  const [filters, setFilters] = useState<ComplaintFilters>({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    category: searchParams.get("category") || "",
    department: searchParams.get("department") || "",
    ward: searchParams.get("ward") || "",
    assignedStaff: searchParams.get("staff") || "",
    isOverdue: searchParams.get("overdue") === "true" ? true : null,
    isEscalated: searchParams.get("escalated") === "true" ? true : null,
    dateFrom: searchParams.get("from") || "",
    dateTo: searchParams.get("to") || "",
  });

  const [bulkAssignDept, setBulkAssignDept] = useState("");
  const [bulkAssignStaff, setBulkAssignStaff] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");

  // Active filter chips
  const activeFilters = useMemo(() => {
    const active: Array<{ key: string; label: string; value: string }> = [];

    if (filters.status) {
      active.push({
        key: "status",
        label: "Status",
        value: filters.status,
      });
    }

    if (filters.priority) {
      active.push({
        key: "priority",
        label: "Priority",
        value: filters.priority,
      });
    }

    if (filters.category) {
      const category = categories.find((c) => c.id === filters.category);
      if (category) {
        active.push({
          key: "category",
          label: "Category",
          value: category.name,
        });
      }
    }

    if (filters.department) {
      const department = departments.find((d) => d.id === filters.department);
      if (department) {
        active.push({
          key: "department",
          label: "Department",
          value: department.name,
        });
      }
    }

    if (filters.ward) {
      const ward = wards.find((w) => w.id === filters.ward);
      if (ward) {
        active.push({
          key: "ward",
          label: "Ward",
          value: `Ward ${ward.ward_number}`,
        });
      }
    }

    if (filters.assignedStaff) {
      const staff = staffUsers.find((s) => s.id === filters.assignedStaff);
      if (staff) {
        active.push({
          key: "assignedStaff",
          label: "Assigned To",
          value: staff.user_profiles?.full_name || staff.email,
        });
      }
    }

    if (filters.isOverdue) {
      active.push({
        key: "isOverdue",
        label: "Overdue",
        value: "Overdue Only",
      });
    }

    if (filters.isEscalated) {
      active.push({
        key: "isEscalated",
        label: "Escalated",
        value: "Escalated Only",
      });
    }

    if (filters.dateFrom) {
      active.push({
        key: "dateFrom",
        label: "From",
        value: new Date(filters.dateFrom).toLocaleDateString(),
      });
    }

    if (filters.dateTo) {
      active.push({
        key: "dateTo",
        label: "To",
        value: new Date(filters.dateTo).toLocaleDateString(),
      });
    }

    return active;
  }, [filters, categories, departments, wards, staffUsers]);

  const loadComplaints = async (activeFilters: ComplaintFilters) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_filtered_complaints", {
        p_status: activeFilters.status || null,
        p_priority: activeFilters.priority || null,
        p_category_id: activeFilters.category || null,
        p_department_id: activeFilters.department || null,
        p_ward_id: activeFilters.ward || null,
        p_assigned_staff_id: activeFilters.assignedStaff || null,
        p_search: activeFilters.search || null,
        p_is_overdue: activeFilters.isOverdue,
        p_is_escalated: activeFilters.isEscalated,
        p_date_from: activeFilters.dateFrom || null,
        p_date_to: activeFilters.dateTo || null,
        p_limit: 100,
        p_offset: 0,
      });

      if (error) throw error;

      setComplaints(data || []);
    } catch (error) {
      console.error("Error loading complaints:", error);
      showErrorToast("Failed to load complaints");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilterCounts = async () => {
    try {
      const { data, error } = await supabase.rpc("get_complaint_filter_counts");

      if (error) throw error;

      const counts: FilterCounts = {
        status: [],
        priority: [],
        categories: [],
        departments: [],
        wards: [],
      };

      data?.forEach((row: FilterCountsData) => {
        if (row.status) {
          counts.status.push({ value: row.status, count: row.count });
        }
        if (row.priority) {
          counts.priority.push({ value: row.priority, count: row.count });
        }
        if (row.category_name) {
          const category = categories.find((c) => c.name === row.category_name);
          if (category) {
            counts.categories.push({
              value: category.id,
              label: row.category_name,
              count: row.count,
            });
          }
        }
        if (row.department_name) {
          const department = departments.find((d) => d.name === row.department_name);
          if (department) {
            counts.departments.push({
              value: department.id,
              label: row.department_name,
              count: row.count,
            });
          }
        }
        if (row.ward_number) {
          const ward = wards.find((w) => w.ward_number === row.ward_number);
          if (ward) {
            counts.wards.push({
              value: ward.id,
              label: `Ward ${row.ward_number}`,
              count: row.count,
            });
          }
        }
      });

      setFilterCounts(counts);
    } catch (error) {
      console.error("Error loading filter counts:", error);
    }
  };

  useEffect(() => {
    void loadComplaints(filters);
    void loadFilterCounts();
  }, []);

  const handleFilterChange = (
    key: keyof ComplaintFilters,
    value: string | boolean | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const applyFilters = () => {
    void loadComplaints(filters);
  };

  const clearFilters = () => {
    const resetFilters: ComplaintFilters = {
      search: "",
      status: "",
      priority: "",
      category: "",
      department: "",
      ward: "",
      assignedStaff: "",
      isOverdue: null,
      isEscalated: null,
      dateFrom: "",
      dateTo: "",
    };
    setFilters(resetFilters);
    void loadComplaints(resetFilters);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === complaints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(complaints.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkAssign = async () => {
    if (selectedIds.size === 0) return;

    try {
      const { data, error } = await supabase.rpc("bulk_assign_complaints", {
        p_complaint_ids: Array.from(selectedIds),
        p_department_id: bulkAssignDept || null,
        p_staff_id: bulkAssignStaff || null,
        p_note: "Bulk assignment via admin portal",
      });

      if (error) throw error;

      showSuccessToast(
        data?.[0]?.message || "Complaints assigned successfully"
      );
      setSelectedIds(new Set());
      setBulkAssignDept("");
      setBulkAssignStaff("");
      void loadComplaints(filters);
    } catch (error) {
      console.error("Error bulk assigning:", error);
      showErrorToast("Failed to assign complaints");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.size === 0 || !bulkStatus) return;

    try {
      const { data, error } = await supabase.rpc(
        "bulk_update_complaint_status",
        {
          p_complaint_ids: Array.from(selectedIds),
          p_new_status: bulkStatus,
          p_note: "Bulk status update via admin portal",
        }
      );

      if (error) throw error;

      showSuccessToast(
        data?.[0]?.message || "Status updated successfully"
      );
      setSelectedIds(new Set());
      setBulkStatus("");
      void loadComplaints(filters);
    } catch (error) {
      console.error("Error bulk updating status:", error);
      showErrorToast("Failed to update status");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Tracking Code",
      "Title",
      "Status",
      "Priority",
      "Category",
      "Ward",
      "Assigned Staff",
      "Citizen",
      "Submitted Date",
      "Is Overdue",
    ];

    const rows = complaints.map((c) => [
      c.tracking_code,
      (c.title || "").replace(/,/g, ";"),
      c.status,
      c.priority,
      c.category_name || "",
      `Ward ${c.ward_number || ""}`,
      c.assigned_staff_name || "Unassigned",
      c.citizen_name || c.citizen_email || "",
      new Date(c.submitted_at).toLocaleDateString(),
      c.is_overdue ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Complaints Master Table
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {complaints.length} complaints • {selectedIds.size} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void loadComplaints(filters)}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/admin/complaints/map">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Map View
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + filters */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[300px] flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by tracking code, title, citizen name, phone..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isLoading && applyFilters()
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              onClick={() => setShowFilters((s) => !s)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Button onClick={applyFilters} disabled={isLoading}>
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="ghost">
              Clear All
            </Button>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-xs">
                    {filter.label}: {filter.value}
                  </span>
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {showFilters && (
            <div className="mt-6 grid grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  {filterCounts.status.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Priority</option>
                  {filterCounts.priority.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {filterCounts.categories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Departments</option>
                  {filterCounts.departments.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Ward
                </label>
                <select
                  value={filters.ward}
                  onChange={(e) => handleFilterChange("ward", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Wards</option>
                  {filterCounts.wards.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned staff */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assigned Staff
                </label>
                <select
                  value={filters.assignedStaff}
                  onChange={(e) =>
                    handleFilterChange("assignedStaff", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Staff</option>
                  {staffUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.user_profiles?.full_name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date range */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange("dateFrom", e.target.value)
                      }
                      placeholder="From"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        handleFilterChange("dateTo", e.target.value)
                      }
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>

              {/* Boolean filters */}
              <div className="flex items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.isOverdue === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "isOverdue",
                        e.target.checked ? true : null
                      )
                    }
                    className="rounded border-slate-300"
                  />
                  Overdue Only
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.isEscalated === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "isEscalated",
                        e.target.checked ? true : null
                      )
                    }
                    className="rounded border-slate-300"
                  />
                  Escalated Only
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UsersIcon className="h-5 w-5" />
              Bulk Actions ({selectedIds.size} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap items-end gap-4">
                {/* Assign section */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Assign Department</label>
                  <select
                    value={bulkAssignDept}
                    onChange={(e) => setBulkAssignDept(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Assign Staff</label>
                  <select
                    value={bulkAssignStaff}
                    onChange={(e) => setBulkAssignStaff(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select Staff</option>
                    {staffUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.user_profiles?.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleBulkAssign} className="h-10">
                  Assign Selected
                </Button>
              </div>

              <div className="flex flex-wrap items-end gap-4">
                {/* Status update */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="received">Received</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <Button onClick={handleBulkStatusUpdate} className="h-10">
                  Update Status
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="h-10"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Filter className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm">No complaints found matching the current filters.</p>
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="hover:text-blue-600"
                        aria-label="Toggle select all complaints"
                      >
                        {selectedIds.size === complaints.length ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Title & Citizen
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Category
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Ward
                    </th>
                    <th className="w-28 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Status
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Priority
                    </th>
                    <th className="w-40 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Assigned To
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Date
                    </th>
                    <th className="w-20 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className={`transition-colors hover:bg-slate-50 ${
                        complaint.is_overdue ? "border-l-4 border-l-red-500 bg-red-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleSelect(complaint.id)}
                          className="hover:text-blue-600"
                          aria-label={`Toggle select complaint ${complaint.tracking_code}`}
                        >
                          {selectedIds.has(complaint.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/complaints/${complaint.id}`}
                          className="flex items-center gap-1 font-mono text-xs font-semibold hover:underline"
                        >
                          {complaint.is_overdue && (
                            <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
                          )}
                          <ComplaintPriorityBadge
                            priority={complaint.priority}
                            size="xs"
                            showLabel={false}
                          />
                          {complaint.tracking_code}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-2">
                            {complaint.title}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <User className="h-3 w-3" />
                            {complaint.citizen_name || complaint.citizen_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-600">
                          {complaint.category_name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin className="h-3 w-3" />
                          Ward {complaint.ward_number || "?"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <ComplaintStatusBadge
                          status={complaint.status}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <ComplaintPriorityBadge
                          priority={complaint.priority}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-600">
                          {complaint.assigned_staff_name || (
                            <span className="text-orange-600">Unassigned</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(complaint.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/complaints/${complaint.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/complaints/${complaint.id}?edit=true`}>
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Assign to Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Change Status
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Escalate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination and summary */}
      {complaints.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {complaints.length} complaints
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8">
                1
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8">
                2
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8">
                3
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}