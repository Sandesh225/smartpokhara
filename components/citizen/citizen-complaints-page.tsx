"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge } from "@/components/citizen/complaints/ComplaintStatusBadge";
import { ComplaintPriorityBadge } from "@/components/citizen/complaints/ComplaintPriorityBadge";
import { Button } from "@/components/ui/button";

interface ComplaintCategory {
  id: string;
  name: string;
  name_nepali?: string | null;
}

interface ComplaintWard {
  id: string;
  ward_number: number;
  name: string;
  name_nepali?: string | null;
}

interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  submitted_at: string;
  category?: ComplaintCategory | null;
  ward?: ComplaintWard | null;
}

interface Category {
  id: string;
  name: string;
  name_nepali?: string | null;
}

interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali?: string | null;
}

interface CitizenComplaintsPageProps {
  complaints: Complaint[];
  categories: Category[];
  wards: Ward[];
}

export function CitizenComplaintsPage({
  complaints: initialComplaints,
  categories,
  wards,
}: CitizenComplaintsPageProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    ward: "",
  });

  useEffect(() => {
    let filtered = initialComplaints;

    if (filters.status) {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter((c) => c.priority === filters.priority);
    }
    if (filters.category) {
      filtered = filtered.filter(
        (c) => c.category && c.category.id === filters.category
      );
    }
    if (filters.ward) {
      filtered = filtered.filter((c) => c.ward && c.ward.id === filters.ward);
    }

    setComplaints(filtered);
  }, [filters, initialComplaints]);

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      category: "",
      ward: "",
    });
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.category || filters.ward;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Complaints</h1>
          <p className="mt-2 text-slate-600">
            Track and manage all your submitted complaints.
          </p>
        </div>
        <Link href="/citizen/complaints/new">
          <Button>New Complaint</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="received">Received</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority */}
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Ward */}
            <select
              value={filters.ward}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, ward: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Wards</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  Ward {ward.ward_number} - {ward.name}
                </option>
              ))}
            </select>

            <div className="flex items-center">
              <span className="text-sm text-slate-600">
                {complaints.length} complaint
                {complaints.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          {complaints.length === 0 ? (
            <div className="py-12 text-center">
              {hasActiveFilters ? (
                <>
                  <p className="text-slate-500">
                    No complaints match your filters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-500">
                    You haven&apos;t submitted any complaints yet.
                  </p>
                  <Link href="/citizen/complaints/new">
                    <Button>Submit Your First Complaint</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {complaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  href={`/citizen/complaints/${complaint.id}`}
                  className="block -mx-4 rounded px-4 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-mono text-sm font-semibold text-blue-600">
                          {complaint.tracking_code}
                        </p>
                        <ComplaintStatusBadge
                          status={complaint.status}
                          size="sm"
                        />
                        <ComplaintPriorityBadge
                          priority={complaint.priority}
                          size="sm"
                        />
                      </div>
                      <p className="mt-2 font-medium text-slate-900">
                        {complaint.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        {complaint.category && (
                          <span>{complaint.category.name}</span>
                        )}
                        {complaint.ward && (
                          <span>Ward {complaint.ward.ward_number}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="whitespace-nowrap text-sm text-slate-500">
                        {new Date(complaint.submitted_at).toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(complaint.submitted_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
