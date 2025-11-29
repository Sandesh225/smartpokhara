"use client";

import Link from "next/link";
import { ComplaintStatusBadge } from "@/components/admin/complaint-status-badge";
import { ComplaintPriorityBadge } from "@/components/admin/complaint-priority-badge";
import type { ComplaintListItem } from "@/lib/types/complaints";

interface RecentComplaintsTableProps {
  complaints: ComplaintListItem[];
}

export function RecentComplaintsTable({
  complaints,
}: RecentComplaintsTableProps) {
  if (!complaints.length) {
    return (
      <div className="flex min-h-[120px] items-center justify-center bg-slate-50 px-6 py-10 text-sm text-slate-500">
        No complaints available yet. New submissions will appear here in
        chronological order.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Tracking Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {complaints.map((complaint, idx) => {
            const submittedDate = new Date(complaint.submitted_at);
            const isStriped = idx % 2 === 1;

            return (
              <tr
                key={complaint.id}
                className={`transition-colors ${
                  isStriped ? "bg-slate-50/40" : "bg-white"
                } hover:bg-blue-50/40`}
              >
                <td className="px-6 py-4 align-middle">
                  <Link
                    href={`/admin/complaints/${complaint.id}`}
                    className="font-mono text-xs font-semibold text-blue-700 underline-offset-2 hover:text-blue-900 hover:underline"
                  >
                    {complaint.tracking_code}
                  </Link>
                </td>
                <td className="max-w-xs px-6 py-4 align-middle">
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-medium text-slate-900">
                      {complaint.title}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {complaint.citizen_name ||
                        complaint.citizen_email ||
                        "Citizen"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 align-middle text-xs text-slate-600">
                  {complaint.category_name || "-"}
                </td>
                <td className="px-6 py-4 align-middle">
                  <ComplaintStatusBadge status={complaint.status} size="sm" />
                </td>
                <td className="px-6 py-4 align-middle">
                  <ComplaintPriorityBadge
                    priority={complaint.priority}
                    size="sm"
                  />
                </td>
                <td className="px-6 py-4 align-middle text-xs text-slate-600">
                  <span className="block">
                    {submittedDate.toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="mt-0.5 block text-[0.65rem] text-slate-400">
                    {submittedDate.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
