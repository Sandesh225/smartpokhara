"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  MoreHorizontal,
  Clock,
  UserCog,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ComplaintsTableProps {
  data: any[];
  loading: boolean;
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function ComplaintsTable({
  data,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  pagination,
}: ComplaintsTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
          <Eye className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
          No Records Found
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Adjust your filters to broaden your search.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(c) => onSelectAll(!!c)}
                  className="rounded-md border-slate-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Tracking ID
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Issue Details
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Reporter
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Ward
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Priority / SLA
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Manage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "group transition-colors duration-150",
                  selectedIds.includes(row.id)
                    ? "bg-primary/5"
                    : "hover:bg-slate-50/50"
                )}
              >
                <td className="px-4 py-2.5">
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onCheckedChange={(c) => onSelect(row.id, !!c)}
                    className="rounded-md border-slate-300"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/complaints/${row.id}`}
                    className="font-mono text-[11px] font-bold text-primary hover:underline"
                  >
                    #{row.tracking_code}
                  </Link>
                </td>
                <td className="px-4 py-2.5 max-w-[240px]">
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-slate-900 truncate text-[13px]">
                      {row.title}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate mt-0.5">
                      {row.category_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white shadow-sm">
                      <AvatarImage src={row.citizen_avatar} />
                      <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px] font-bold">
                        {row.citizen_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-medium text-slate-700">
                      {row.citizen_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black border-slate-200 bg-slate-50 text-slate-600"
                  >
                    WARD {row.ward_number}
                  </Badge>
                </td>
                <td className="px-4 py-2.5">
                  <BadgeStatus status={row.status} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col gap-1">
                    <BadgePriority priority={row.priority} />
                    {row.sla_due_at && (
                      <div className="flex items-center gap-1 text-[10px] font-medium whitespace-nowrap">
                        <Clock
                          className={cn(
                            "w-3 h-3",
                            new Date(row.sla_due_at) < new Date()
                              ? "text-red-500"
                              : "text-slate-400"
                          )}
                        />
                        {new Date(row.sla_due_at) < new Date() ? (
                          <span className="text-red-600 font-black uppercase tracking-tighter">
                            Overdue
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {formatDistanceToNow(new Date(row.sla_due_at))}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl shadow-xl border-slate-200"
                    >
                      <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                        Operation
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin/complaints/${row.id}`}
                          className="cursor-pointer text-xs font-bold py-2.5"
                        >
                          <Eye className="w-4 h-4 mr-2 text-primary" /> View
                          Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-xs font-bold py-2.5">
                        <UserCog className="w-4 h-4 mr-2 text-slate-500" />{" "}
                        Assign Staff
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 cursor-pointer text-xs font-bold py-2.5 focus:bg-red-50 focus:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Mark as Spam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: Compact Pagination */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          {pagination.total} Records Total
        </p>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.pageIndex === 1}
            onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
            className="h-8 text-[11px] font-bold rounded-lg border-slate-200"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={
              pagination.pageIndex * pagination.pageSize >= pagination.total
            }
            onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
            className="h-8 text-[11px] font-bold rounded-lg border-slate-200"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Optimized Badge Components
function BadgeStatus({ status }: { status: string }) {
  const styles: any = {
    received: "bg-slate-100 text-slate-700 border-slate-200",
    assigned: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-purple-50 text-purple-700 border-purple-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-200 text-slate-800 border-slate-300",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xs",
        styles[status] || styles.received
      )}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

function BadgePriority({ priority }: { priority: string }) {
  const styles: any = {
    low: "text-slate-500",
    medium: "text-blue-600",
    high: "text-orange-600 font-black",
    critical: "text-red-600 font-black",
    urgent: "text-red-700 font-black",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full ring-2 ring-white",
          priority === "high" || priority === "critical"
            ? "bg-red-500 animate-pulse"
            : "bg-slate-300"
        )}
      />
      <span
        className={cn(
          "text-[10px] uppercase tracking-widest",
          styles[priority] || styles.medium
        )}
      >
        {priority}
      </span>
    </div>
  );
}
