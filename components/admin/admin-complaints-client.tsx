// components/admin/admin-complaints-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { ComplaintPriorityBadge } from "@/components/complaints/complaint-priority-badge";
import type {
  Category,
  Ward,
  Department,
  UserSummary,
  ComplaintListItem,
} from "@/lib/types/complaints";
import type { ComplaintFilters } from "@/lib/types/admin";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-service";

interface AdminComplaintsClientProps {
  categories: Category[];
  departments: Department[];
  wards: Ward[];
  staffUsers: UserSummary[];
}

export function AdminComplaintsClient({
  categories,
  departments,
  wards,
  staffUsers,
}: AdminComplaintsClientProps) {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    void loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_filtered_complaints", {
        p_status: filters.status || null,
        p_priority: filters.priority || null,
        p_category_id: filters.category || null,
        p_department_id: filters.department || null,
        p_ward_id: filters.ward || null,
        p_assigned_staff_id: filters.assignedStaff || null,
        p_search: filters.search || null,
        p_is_overdue: filters.isOverdue,
        p_is_escalated: filters.isEscalated,
        p_date_from: filters.dateFrom || null,
        p_date_to: filters.dateTo || null,
        p_limit: 200,
        p_offset: 0,
      });

      if (error) throw error;

      setComplaints((data || []) as ComplaintListItem[]);
    } catch (error) {
      console.error("Error loading complaints:", error);
      showErrorToast("Failed to load complaints");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    key: keyof ComplaintFilters,
    value: string | boolean | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    void loadComplaints();
  };

  const clearFilters = () => {
    setFilters({
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
    });
    void loadComplaints();
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
        (data as any)?.[0]?.message || "Complaints assigned successfully"
      );
      setSelectedIds(new Set());
      setBulkAssignDept("");
      setBulkAssignStaff("");
      void loadComplaints();
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
        (data as any)?.[0]?.message || "Status updated successfully"
      );
      setSelectedIds(new Set());
      setBulkStatus("");
      void loadComplaints();
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
    a.download = `complaints_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Complaints Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {complaints.length} complaints • {selectedIds.size} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void loadComplaints()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[260px] flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by tracking code, title, citizen name..."
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
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button onClick={applyFilters} disabled={isLoading}>
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="ghost">
              Clear All
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="received">Received</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
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
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
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
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
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
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ward
                </label>
                <select
                  value={filters.ward}
                  onChange={(e) =>
                    handleFilterChange("ward", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All Wards</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      Ward {ward.ward_number} - {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned staff */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
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

              {/* Date from */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                />
              </div>

              {/* Date to */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    handleFilterChange("dateTo", e.target.value)
                  }
                />
              </div>

              {/* Overdue */}
              <div className="flex items-end">
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
                    className="rounded"
                  />
                  Overdue Only
                </label>
              </div>

              {/* Escalated */}
              <div className="flex items-end">
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
                    className="rounded"
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
            <div className="flex flex-wrap gap-4">
              {/* Assign */}
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Assign Department
                  </label>
                  <select
                    value={bulkAssignDept}
                    onChange={(e) => setBulkAssignDept(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Assign Staff
                  </label>
                  <select
                    value={bulkAssignStaff}
                    onChange={(e) => setBulkAssignStaff(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Select Staff</option>
                    {staffUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.user_profiles?.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleBulkAssign}>Assign Selected</Button>
              </div>

              <div className="hidden h-8 w-px bg-slate-300 sm:block" />

              {/* Status update */}
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Update Status
                  </label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="received">Received</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <Button onClick={handleBulkStatusUpdate}>
                  Update Status
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="ml-auto"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No complaints found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={toggleSelectAll}
                        className="hover:text-blue-600"
                      >
                        {selectedIds.size === complaints.length ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Tracking Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Ward
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Assigned
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className={`transition-colors hover:bg-slate-50 ${
                        complaint.is_overdue ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelect(complaint.id)}
                          className="hover:text-blue-600"
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
                          className="flex items-center gap-1 font-mono text-xs font-semibold text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {complaint.is_overdue && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          {complaint.tracking_code}
                        </Link>
                      </td>
                      <td className="max-w-xs px-4 py-4">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {complaint.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {complaint.citizen_name || complaint.citizen_email}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {complaint.category_name || "-"}
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
                      <td className="px-4 py-4 text-xs text-slate-600">
                        Ward {complaint.ward_number || "?"}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {complaint.assigned_staff_name || "Unassigned"}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {new Date(
                          complaint.submitted_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
