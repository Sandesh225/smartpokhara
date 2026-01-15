"use client";

import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  ArrowUpRight,
  CheckSquare,
  MapPin,
  Clock,
} from "lucide-react";
import { StatusBadge } from "@/components/supervisor/shared/StatusBadge";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";
import { SLACountdown } from "@/components/supervisor/shared/SLACountdown";
import { EmptyState } from "@/components/supervisor/shared/EmptyState";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
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
      <div className="flex-1 flex items-center justify-center bg-card/10">
        <LoadingSpinner message="Syncing Ledger Data..." />
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          title="No Records Found"
          message="Adjust your parameters to broaden the search."
        />
      </div>
    );
  }

  const allSelected =
    complaints.length > 0 && selectedIds.length === complaints.length;

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-primary/5 dark:bg-white/5 backdrop-blur-md">
              <th className="sticky top-0 z-10 w-12 px-6 py-4 border-b border-border/50">
                <input
                  type="checkbox"
                  className="rounded-sm border-primary/30 bg-background text-primary focus:ring-primary h-4 w-4 transition-all"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="sticky top-0 z-10 px-4 py-4 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Reference & Subject
                </span>
              </th>
              <th className="sticky top-0 z-10 px-4 py-4 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Jurisdiction
                </span>
              </th>
              <th className="sticky top-0 z-10 px-4 py-4 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Status
                </span>
              </th>
              <th className="sticky top-0 z-10 px-4 py-4 border-b border-border/50 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Priority
                </span>
              </th>
              <th className="sticky top-0 z-10 px-4 py-4 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Assigned Personnel
                </span>
              </th>
              <th className="sticky top-0 z-10 px-4 py-4 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Resolution Window
                </span>
              </th>
              <th className="sticky top-0 z-10 w-10 px-6 py-4 border-b border-border/50"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {complaints.map((complaint) => (
              <tr
                key={complaint.id}
                className={cn(
                  "group transition-all duration-200 hover:bg-primary/5 dark:hover:bg-primary/10",
                  selectedIds.includes(complaint.id)
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "bg-transparent"
                )}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded-sm border-primary/30 bg-background text-primary focus:ring-primary h-4 w-4"
                    checked={selectedIds.includes(complaint.id)}
                    onChange={(e) => onSelect(complaint.id, e.target.checked)}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/supervisor/complaints/${complaint.id}`}
                      className="font-mono text-xs font-bold text-primary hover:underline tracking-tighter tabular-nums"
                    >
                      #{complaint.tracking_code}
                    </Link>
                    <span className="text-sm font-semibold text-foreground truncate max-w-[220px]">
                      {complaint.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(complaint.submitted_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary/60" />
                      Ward {complaint.ward.ward_number}
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter opacity-70">
                      {complaint.category.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={complaint.status} variant="complaint" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <PriorityIndicator
                      priority={complaint.priority}
                      size="sm"
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  {complaint.assigned_staff ? (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-black text-primary border border-primary/20">
                        {complaint.assigned_staff.full_name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-foreground/80 truncate max-w-[120px]">
                        {complaint.assigned_staff.full_name}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Unassigned
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="min-w-[120px]">
                    <SLACountdown
                      deadline={complaint.sla_due_at}
                      status={complaint.status}
                      variant="progress"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative group/menu inline-block">
                    <button className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 stone-card-elevated glass opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-30 overflow-hidden">
                      <div className="p-1">
                        <Link
                          href={`/supervisor/complaints/${complaint.id}`}
                          className="flex items-center px-3 py-2.5 text-xs font-bold text-foreground hover:bg-primary/10 rounded-md transition-colors"
                        >
                          <Eye className="mr-3 h-4 w-4 text-primary" /> View
                          Details
                        </Link>
                        <button className="flex w-full items-center px-3 py-2.5 text-xs font-bold text-foreground hover:bg-primary/10 rounded-md transition-colors">
                          <UserPlus className="mr-3 h-4 w-4 text-primary" />{" "}
                          Reassign
                        </button>
                        <button className="flex w-full items-center px-3 py-2.5 text-xs font-bold text-foreground hover:bg-primary/10 rounded-md transition-colors">
                          <ArrowUpRight className="mr-3 h-4 w-4 text-secondary" />{" "}
                          Escalate
                        </button>
                        <div className="h-px bg-border/40 my-1" />
                        <button className="flex w-full items-center px-3 py-2.5 text-xs font-black text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors uppercase tracking-widest">
                          <CheckSquare className="mr-3 h-4 w-4" /> Resolve
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

      {/* Table Footer / Summary */}
      <div className="p-4 bg-muted/30 border-t border-border/40 flex items-center justify-between">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Showing {complaints.length} Records in Current View
        </p>
        <div className="flex gap-2">{/* Pagination could go here */}</div>
      </div>
    </div>
  );
}