"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge } from "@/components/citizen/complaints/ComplaintStatusBadge";
import { ComplaintPriorityBadge } from "@/components/citizen/complaints/ComplaintPriorityBadge";
import { Button } from "@/components/ui/button";
import {
  Filter,
  X,
  FileText,
  MapPin,
  Calendar,
  PlusCircle,
  Search,
  Inbox,
} from "lucide-react";
import type {
  ComplaintStatus,
  ComplaintPriority,
} from "@/lib/types/complaints";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    ward: "",
  });

  useEffect(() => {
    let filtered = initialComplaints;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.tracking_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
  }, [filters, initialComplaints, searchTerm]);

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      category: "",
      ward: "",
    });
    setSearchTerm("");
  };

  const hasActiveFilters =
    filters.status ||
    filters.priority ||
    filters.category ||
    filters.ward ||
    searchTerm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl border border-white/30 animate-slide-down">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                My Complaints
              </h1>
              <p className="mt-2 text-slate-600">
                Track and manage all your submitted complaints
              </p>
            </div>
            <Link href="/citizen/complaints/new" className="group">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                New Complaint
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass rounded-2xl p-6 shadow-xl border border-white/30 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or tracking code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                  {Object.values(filters).filter(Boolean).length +
                    (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-down">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="received">Received</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.ward}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, ward: e.target.value }))
                }
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Wards</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    Ward {ward.ward_number} - {ward.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <FileText className="w-4 h-4" />
            <span className="font-semibold">{complaints.length}</span>
            complaint{complaints.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Complaints List */}
        <div className="glass rounded-2xl shadow-xl border border-white/30 overflow-hidden animate-slide-up">
          {complaints.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />
          ) : (
            <div className="divide-y divide-slate-200">
              {complaints.map((complaint, index) => (
                <ComplaintRow
                  key={complaint.id}
                  complaint={complaint}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComplaintRow({
  complaint,
  index,
}: {
  complaint: Complaint;
  index: number;
}) {
  return (
    <Link
      href={`/citizen/complaints/${complaint.id}`}
      className="block p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <code className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-md font-mono group-hover:bg-blue-200 transition-colors">
              {complaint.tracking_code}
            </code>
            <ComplaintStatusBadge status={complaint.status} size="sm" />
            <ComplaintPriorityBadge priority={complaint.priority} size="sm" />
          </div>

          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
            {complaint.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            {complaint.category && (
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>{complaint.category.name}</span>
              </div>
            )}
            {complaint.ward && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Ward {complaint.ward.ward_number}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(complaint.submitted_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  hasFilters,
  clearFilters,
}: {
  hasFilters: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
        <Inbox className="w-12 h-12 text-slate-400" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No complaints found
          </h3>
          <p className="text-slate-600 mb-6">Try adjusting your filters</p>
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No complaints yet
          </h3>
          <p className="text-slate-600 mb-6">
            You haven't submitted any complaints
          </p>
          <Link href="/citizen/complaints/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <PlusCircle className="w-4 h-4 mr-2" />
              Submit Your First Complaint
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}