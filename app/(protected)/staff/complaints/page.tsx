// app/(protected)/staff/complaints/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Filter, ArrowRight } from "lucide-react";
import type { Database } from "@/lib/types/database.types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"] & {
  complaint_categories?: { name: string } | null;
  wards?: { ward_number: number; name: string } | null;
  user_profiles?: { full_name: string } | null;
};

export default function StaffComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  async function loadComplaints() {
    setLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from("complaints")
        .select(
          `
          *,
          complaint_categories(name),
          wards!fk_complaints_ward(ward_number, name),
          user_profiles(full_name)
        `
        )
        .order("submitted_at", { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error loading complaints:", error);
    } finally {
      setLoading(false);
    }
  }

  const statusConfig: Record<string, { color: string; label: string }> = {
    submitted: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Submitted",
    },
    assigned: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Assigned",
    },
    received: {
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      label: "Received",
    },
    accepted: {
      color: "bg-cyan-100 text-cyan-800 border-cyan-200",
      label: "Accepted",
    },
    in_progress: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      label: "In Progress",
    },
    resolved: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Resolved",
    },
    closed: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: "Closed",
    },
  };

  const priorityConfig: Record<string, { color: string; label: string }> = {
    low: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Low" },
    medium: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Medium",
    },
    high: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "High",
    },
    urgent: {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Urgent",
    },
    critical: {
      color: "bg-red-200 text-red-900 border-red-300",
      label: "Critical",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            All Complaints
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and manage complaints in your area.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title or tracking code..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filters.status || filters.priority || filters.search) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({ status: "", priority: "", search: "" })
                }
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Complaints List ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading complaints...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 font-medium">No complaints found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => {
                const statusStyle =
                  statusConfig[complaint.status] || statusConfig.submitted;
                const priorityStyle =
                  priorityConfig[complaint.priority] || priorityConfig.medium;

                return (
                  <div
                    key={complaint.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {complaint.tracking_code}
                        </span>
                        <Badge className={`${priorityStyle.color} border`}>
                          {priorityStyle.label}
                        </Badge>
                        <Badge className={`${statusStyle.color} border`}>
                          {statusStyle.label}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900">
                        {complaint.title}
                      </h3>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>
                          {complaint.complaint_categories?.name ||
                            "Uncategorized"}
                        </span>
                        <span>•</span>
                        <span>
                          Ward {complaint.wards?.ward_number || "N/A"}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(
                            complaint.submitted_at
                          ).toLocaleDateString()}
                        </span>
                        {complaint.user_profiles?.full_name && (
                          <>
                            <span>•</span>
                            <span>by {complaint.user_profiles.full_name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={`/staff/complaints/${complaint.id}`}>
                      <Button size="sm" className="w-full sm:w-auto">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}