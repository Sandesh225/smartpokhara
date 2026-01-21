"use client";

import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  formatDistanceToNow,
  differenceInDays,
  differenceInHours,
} from "date-fns";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpDown,
  Eye,
  MapPin,
  MoreVertical,
  Tag,
  CheckCircle2,
  Copy,
  Printer,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building2,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  Complaint,
  ComplaintStatus,
} from "@/lib/supabase/queries/complaints";

import { COMPLAINT_STATUS_CONFIG } from "@/app/(protected)/citizen/complaints/_components/form-steps/complaint";
import { COMPLAINT_PRIORITY_CONFIG } from "@/app/(protected)/citizen/complaints/_components/form-steps/complaint";

// --- SUB-COMPONENTS ---

const LiveSLACell = ({
  submittedAt,
  slaDueAt,
  status,
}: {
  submittedAt: string;
  slaDueAt: string | null;
  status: string;
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!slaDueAt)
    return <span className="text-muted-foreground text-xs italic font-medium">Not Set</span>;

  const isResolved = ["resolved", "closed", "rejected"].includes(status);

  if (isResolved) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
        <CheckCircle2 className="h-3.5 w-3.5" />
        SLA Met
      </div>
    );
  }

  const start = new Date(submittedAt).getTime();
  const end = new Date(slaDueAt).getTime();
  const totalDuration = Math.max(end - start, 1);
  const elapsed = now - start;
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  const isOverdue = now > end;

  let timeLabel = "";
  if (isOverdue) {
    const days = differenceInDays(now, end);
    timeLabel = days > 0 ? `${days}d Overdue` : "Overdue";
  } else {
    const days = differenceInDays(end, now);
    const hours = differenceInHours(end, now) % 24;
    timeLabel = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  }

  return (
    <div className="w-[140px] space-y-1.5">
      <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
        <span className={isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
          {timeLabel}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress
        value={progress}
        className={cn(
          "h-2 rounded-full bg-muted",
          isOverdue
            ? "[&>div]:bg-red-500"
            : progress > 80
              ? "[&>div]:bg-orange-500"
              : "[&>div]:bg-blue-600 dark:[&>div]:bg-blue-500"
        )}
      />
    </div>
  );
};

/**
 * MOBILE CARD VIEW
 */
const ComplaintMobileCard = memo(
  ({
    complaint,
    onClick,
  }: {
    complaint: Complaint;
    onClick: (c: Complaint) => void;
  }) => {
    const status = COMPLAINT_STATUS_CONFIG[complaint.status];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(complaint)}
        className="bg-card border-2 border-border hover:border-primary/40 rounded-2xl p-5 elevation-1 hover:elevation-2 active:elevation-1 transition-all space-y-3"
      >
        <div className="flex justify-between items-start gap-3">
          <code className="bg-muted text-foreground px-3 py-1.5 rounded-lg font-mono text-xs font-bold border-2 border-border">
            {complaint.tracking_code}
          </code>
          <Badge
            className={cn(
              "px-3 py-1 text-xs uppercase font-black border-0",
              status.pill
            )}
          >
            {status.label}
          </Badge>
        </div>

        <div>
          <h4 className="font-bold text-foreground leading-snug line-clamp-2 mb-2">
            {complaint.title}
          </h4>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Ward {complaint.ward?.ward_number}
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {complaint.category?.name}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t-2 border-border flex justify-between items-center">
          <LiveSLACell
            submittedAt={complaint.submitted_at}
            slaDueAt={complaint.sla_due_at}
            status={complaint.status}
          />
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </motion.div>
    );
  }
);

ComplaintMobileCard.displayName = "ComplaintMobileCard";

// --- MAIN TABLE ---

export function ComplaintsTable({
  complaints,
  total,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onSortChange,
  sortBy = "submitted_at",
  sortOrder = "DESC",
  onRowClick,
  basePath = "/citizen/complaints",
}: any) {
  const router = useRouter();

  const handleRowClick = useCallback(
    (complaint: Complaint) => {
      if (onRowClick) onRowClick(complaint);
      else router.push(`${basePath}/${complaint.id}`);
    },
    [onRowClick, router, basePath]
  );

  const columns: ColumnDef<Complaint>[] = useMemo(
    () => [
      {
        accessorKey: "tracking_code",
        header: "Tracking ID",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 group/copy">
            <code className="text-xs font-black text-foreground bg-muted px-3 py-1.5 rounded-lg tracking-tight border border-border">
              {row.original.tracking_code}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover/copy:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.original.tracking_code);
                toast.success("ID Copied");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Complaint Summary",
        cell: ({ row }) => (
          <div className="max-w-[300px] space-y-1.5">
            <p className="font-bold text-foreground truncate leading-tight">
              {row.original.title}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {row.original.category?.name}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const p = row.original.priority || "medium";
          const config = COMPLAINT_PRIORITY_CONFIG[p];
          return (
            <Badge
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-black uppercase border-2 shadow-none",
                config.color
              )}
            >
              {p}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const conf = COMPLAINT_STATUS_CONFIG[row.original.status];
          const StatusIcon = conf.icon;

          return (
            <Badge
              className={cn(
                "gap-1.5 border-2 font-black text-xs uppercase shadow-sm px-3 py-1",
                conf.pill
              )}
            >
              {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
              {conf.label}
            </Badge>
          );
        },
      },
      {
        id: "sla",
        header: "SLA Progress",
        cell: ({ row }) => (
          <LiveSLACell
            submittedAt={row.original.submitted_at}
            slaDueAt={row.original.sla_due_at}
            status={row.original.status}
          />
        ),
      },
      {
        accessorKey: "submitted_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              onSortChange?.(
                "submitted_at",
                sortOrder === "ASC" ? "DESC" : "ASC"
              )
            }
            className="font-bold p-0 hover:bg-transparent"
          >
            Submitted <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm font-bold text-foreground">
            {format(new Date(row.original.submitted_at), "MMM d, yyyy")}
            <span className="block text-xs font-medium text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(row.original.submitted_at))} ago
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:bg-accent"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-52 border-2">
              <DropdownMenuItem onClick={() => handleRowClick(row.original)} className="font-semibold">
                <Eye className="mr-2 h-4 w-4" /> Open Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()} className="font-semibold">
                <Printer className="mr-2 h-4 w-4" /> Print Document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive font-bold">
                <XCircle className="mr-2 h-4 w-4" /> Cancel Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [sortOrder, onSortChange, handleRowClick]
  );

  const table = useReactTable({
    data: complaints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-2xl border-2 border-border overflow-hidden bg-card elevation-1">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="hover:bg-transparent border-b-2 border-border"
                >
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="h-14 px-6 text-xs font-black uppercase tracking-widest text-muted-foreground"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center gap-3 opacity-60">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                        <p className="font-bold text-foreground text-lg">
                          No Registry Records Found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => handleRowClick(row.original)}
                      className="group cursor-pointer hover:bg-accent/50 transition-colors border-b border-border"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {complaints.map((c: Complaint) => (
          <ComplaintMobileCard
            key={c.id}
            complaint={c}
            onClick={handleRowClick}
          />
        ))}
      </div>

      {/* Improved Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Showing{" "}
          <span className="text-foreground">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="text-foreground">
            {Math.min(currentPage * pageSize, total)}
          </span>{" "}
          of <span className="text-foreground">{total}</span> Records
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-xl border-2 font-black text-xs uppercase h-10 px-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <div className="h-10 px-4 flex items-center justify-center bg-card border-2 border-border rounded-xl text-sm font-black">
            {currentPage} / {Math.ceil(total / pageSize) || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= Math.ceil(total / pageSize)}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-xl border-2 font-black text-xs uppercase h-10 px-4"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-14 w-full rounded-2xl" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}