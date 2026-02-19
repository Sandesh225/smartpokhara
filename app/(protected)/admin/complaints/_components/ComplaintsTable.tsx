"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye, MoreHorizontal, Clock, UserCog, Trash2, FileText, AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Complaint } from "@/features/complaints";

interface ComplaintsTableProps {
  data: Complaint[];
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
      <div className="stone-card overflow-hidden p-4">
        <div className="space-y-3 md:space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 md:h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="stone-card border-2 border-dashed py-12 md:py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-xl md:rounded-2xl flex items-center justify-center mb-4 border border-border">
          <FileText className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
          No Records Found
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">
          Adjust your filters to broaden your search.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE VIEW - Hidden on mobile */}
      <div className="hidden lg:block stone-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(c) => onSelectAll(!!c)}
                    className="rounded-md"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Tracking ID
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Issue Details
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Reporter
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Ward
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Priority / SLA
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group transition-colors duration-150",
                    selectedIds.includes(row.id)
                      ? "bg-primary/5"
                      : "hover:bg-muted/30"
                  )}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onCheckedChange={(c) => onSelect(row.id, !!c)}
                      className="rounded-md"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/complaints/${row.id}`}
                      className="font-mono text-xs font-bold text-primary hover:underline"
                    >
                      #{row.tracking_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold text-foreground truncate text-sm">
                        {row.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                        {row.category?.name || "Uncategorized"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-border">
                        <AvatarImage src={(row.citizen as any)?.profile?.profile_photo_url || (row as any).author?.avatar_url} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                          {(row.citizen as any)?.profile?.full_name?.[0] || (row as any).author?.full_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs font-medium text-foreground">
                        {(row.citizen as any)?.profile?.full_name || (row as any).author?.full_name || "Anonymous"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      WARD {row.ward?.ward_number || "N/A"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <BadgeStatus status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <BadgePriority priority={row.priority} />
                      {row.sla_due_at && (
                        <SLAIndicator dueDate={row.sla_due_at} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionsMenu complaintId={row.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD VIEW - Visible only on mobile */}
      <div className="lg:hidden space-y-3">
        {data.map((row) => (
          <div
            key={row.id}
            className={cn(
              "stone-card p-4 space-y-3 transition-all",
              selectedIds.includes(row.id) && "ring-2 ring-primary"
            )}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={selectedIds.includes(row.id)}
                  onCheckedChange={(c) => onSelect(row.id, !!c)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/complaints/${row.id}`}
                    className="font-mono text-xs font-bold text-primary block mb-1"
                  >
                    #{row.tracking_code}
                  </Link>
                  <h3 className="font-bold text-sm text-foreground line-clamp-2">
                    {row.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {row.category?.name || "Uncategorized"}
                  </p>
                </div>
              </div>
              <ActionsMenu complaintId={row.id} />
            </div>

            {/* Status & Priority Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <BadgeStatus status={row.status} />
              <BadgePriority priority={row.priority} />
              <Badge variant="outline" className="text-[9px] font-bold">
                WARD {row.ward?.ward_number || "N/A"}
              </Badge>
            </div>

            {/* Reporter & SLA Row */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage src={row.citizen?.profile?.profile_photo_url || row.author?.avatar_url} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                    {row.citizen?.profile?.full_name?.[0] || row.author?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground truncate">
                  {row.citizen?.profile?.full_name || row.author?.full_name || "Anonymous"}
                </span>
              </div>
              {row.sla_due_at && (
                <SLAIndicator dueDate={row.sla_due_at} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION FOOTER */}
      <div className="stone-card px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
          {pagination.total} Records Total
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.pageIndex === 1}
            onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
            className="h-8 md:h-9 text-xs font-bold"
          >
            Previous
          </Button>
          <div className="flex items-center px-3 py-1 bg-muted rounded-lg">
            <span className="text-xs font-bold text-foreground">
              Page {pagination.pageIndex}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={
              pagination.pageIndex * pagination.pageSize >= pagination.total
            }
            onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
            className="h-8 md:h-9 text-xs font-bold"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

// SUB-COMPONENTS
function BadgeStatus({ status }: { status: string }) {
  const config: Record<string, string> = {
    received: "bg-muted text-foreground border-border",
    assigned: "bg-info-blue/10 text-info-blue border-info-blue/20",
    in_progress: "bg-secondary/10 text-secondary border-secondary/20",
    resolved: "bg-success-green/10 text-success-green border-success-green/20",
    closed: "bg-muted text-muted-foreground border-border",
    rejected: "bg-error-red/10 text-error-red border-error-red/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider border",
        config[status] || config.received
      )}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

function BadgePriority({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    low: "text-muted-foreground",
    medium: "text-info-blue",
    high: "text-warning-amber",
    critical: "text-error-red",
    urgent: "text-error-red",
  };

  const isUrgent = priority === "high" || priority === "critical" || priority === "urgent";

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full ring-2 ring-background",
          isUrgent ? "bg-error-red animate-pulse" : "bg-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-[9px] md:text-[10px] font-bold uppercase tracking-wider",
          config[priority] || config.medium
        )}
      >
        {priority}
      </span>
    </div>
  );
}

function SLAIndicator({ dueDate }: { dueDate: string }) {
  const isOverdue = new Date(dueDate) < new Date();
  
  return (
    <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium whitespace-nowrap">
      <Clock
        className={cn(
          "w-3 h-3",
          isOverdue ? "text-error-red" : "text-muted-foreground"
        )}
      />
      {isOverdue ? (
        <span className="text-error-red font-black uppercase">
          Overdue
        </span>
      ) : (
        <span className="text-muted-foreground">
          {formatDistanceToNow(new Date(dueDate))}
        </span>
      )}
    </div>
  );
}

function ActionsMenu({ complaintId }: { complaintId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl shadow-xl border-border"
      >
        <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`/admin/complaints/${complaintId}`}
            className="cursor-pointer text-xs font-bold"
          >
            <Eye className="w-4 h-4 mr-2 text-primary" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-xs font-bold">
          <UserCog className="w-4 h-4 mr-2 text-secondary" />
          Assign Staff
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-error-red cursor-pointer text-xs font-bold focus:bg-error-red/10 focus:text-error-red">
          <Trash2 className="w-4 h-4 mr-2" />
          Mark as Spam
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}