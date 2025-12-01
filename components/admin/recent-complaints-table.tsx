"use client";

import Link from "next/link";
import { ComplaintStatusBadge } from "@/components/admin/complaint-status-badge";
import { ComplaintPriorityBadge } from "@/components/admin/complaint-priority-badge";
import { FileText, User, Calendar } from "lucide-react";
import type { ComplaintListItem } from "@/lib/types/complaints";

interface RecentComplaintsTableProps {
  complaints: ComplaintListItem[];
}

export function RecentComplaintsTable({
  complaints,
}: RecentComplaintsTableProps) {
  if (!complaints.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
          <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No complaints yet
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          New submissions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tracking Code
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Title
            </th>
            <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Priority
            </th>
            <th className="hidden md:table-cell px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {complaints.map((complaint) => {
            const submittedDate = new Date(complaint.submitted_at);
            return (
              <tr
                key={complaint.id}
                className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/complaints/${complaint.id}`}
                    className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span className="group-hover:underline underline-offset-2">
                      {complaint.tracking_code}
                    </span>
                  </Link>
                </td>
                <td className="max-w-[200px] px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {complaint.title}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <User className="h-3 w-3" />
                      {complaint.citizen_name ||
                        complaint.citizen_email ||
                        "Citizen"}
                    </span>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-5 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {complaint.category_name || "-"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <ComplaintStatusBadge status={complaint.status} size="sm" />
                </td>
                <td className="hidden lg:table-cell px-5 py-4">
                  <ComplaintPriorityBadge
                    priority={complaint.priority}
                    size="sm"
                  />
                </td>
                <td className="hidden md:table-cell px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <div className="flex flex-col">
                      <span>
                        {submittedDate.toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
