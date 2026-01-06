"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Eye, UserPlus, ArrowUpRight, CheckSquare } from "lucide-react";
import { StatusBadge } from "@/components/supervisor/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { EmptyState } from "@/components/supervisor/shared/EmptyState";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";

import Link from "next/link";

interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  category: { name: string };
  ward: { name: string; ward_number: number };
  status: string;
  priority: string;
  assigned_staff: { full_name: string } | null;
  submitted_at: string;
  sla_due_at: string;
}

interface ComplaintsTableViewProps {
  complaints: Complaint[];
  selectedIds: string[];
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  isLoading: boolean;
}

export function ComplaintsTableView({
  complaints,
  selectedIds,
  onSelect,
  onSelectAll,
  isLoading,
}: ComplaintsTableViewProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner message="Loading complaints..." />
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No complaints found"
        message="Try adjusting your filters or search criteria."
      />
    );
  }

  const allSelected = complaints.length > 0 && selectedIds.length === complaints.length;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 font-semibold text-gray-900">ID & Title</th>
              <th className="px-4 py-3 font-semibold text-gray-900">Location</th>
              <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-900">Priority</th>
              <th className="px-4 py-3 font-semibold text-gray-900">Assigned To</th>
              <th className="px-4 py-3 font-semibold text-gray-900">SLA</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {complaints.map((complaint) => (
              <tr
                key={complaint.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedIds.includes(complaint.id) ? "bg-blue-50/30" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedIds.includes(complaint.id)}
                    onChange={(e) => onSelect(complaint.id, e.target.checked)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <Link
                      href={`/supervisor/complaints/${complaint.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {complaint.tracking_code}
                    </Link>
                    <span className="text-gray-600 truncate max-w-[200px]">
                      {complaint.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(complaint.submitted_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col text-gray-600">
                    <span>Ward {complaint.ward.ward_number}</span>
                    <span className="text-xs text-gray-400">{complaint.category.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={complaint.status} variant="complaint" />
                </td>
                <td className="px-4 py-3">
                  <PriorityIndicator priority={complaint.priority} size="sm" />
                </td>
                <td className="px-4 py-3">
                  {complaint.assigned_staff ? (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {complaint.assigned_staff.full_name.charAt(0)}
                      </div>
                      <span className="text-gray-700 truncate max-w-[120px]">
                        {complaint.assigned_staff.full_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SLACountdown 
                    deadline={complaint.sla_due_at} 
                    status={complaint.status} 
                    variant="progress" 
                  />
                </td>
                <td className="px-4 py-3">
                  {/* Dropdown Menu Implementation */}
                  <div className="relative group">
                    <button className="p-1 rounded-md hover:bg-gray-200 text-gray-500">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {/* Simplified Dropdown content for visualization */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 hidden group-hover:block z-20">
                      <div className="py-1">
                        <Link href={`/supervisor/complaints/${complaint.id}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Eye className="mr-3 h-4 w-4 text-gray-400" /> View Details
                        </Link>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <UserPlus className="mr-3 h-4 w-4 text-gray-400" /> Assign
                        </button>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <ArrowUpRight className="mr-3 h-4 w-4 text-gray-400" /> Escalate
                        </button>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                          <CheckSquare className="mr-3 h-4 w-4 text-green-500" /> Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}