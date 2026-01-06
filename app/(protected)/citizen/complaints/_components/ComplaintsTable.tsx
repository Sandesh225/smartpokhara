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
    return <span className="text-slate-400 text-xs italic">Not Set</span>;

  const isResolved = ["resolved", "closed", "rejected"].includes(status);

  if (isResolved) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
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
    <div className="w-[140px] space-y-1">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
        <span className={isOverdue ? "text-red-600" : "text-slate-500"}>
          {timeLabel}
        </span>
        <span className="text-slate-400">{Math.round(progress)}%</span>
      </div>
      <Progress
        value={progress}
        className={cn(
          "h-1.5 rounded-full bg-slate-100",
          isOverdue
            ? "[&>div]:bg-red-500"
            : progress > 80
              ? "[&>div]:bg-orange-500"
              : "[&>div]:bg-blue-600"
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
    // const priority = COMPLAINT_PRIORITY_CONFIG[complaint.priority || "medium"];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(complaint)}
        className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm active:border-blue-300 transition-all space-y-3"
      >
        <div className="flex justify-between items-start">
          <code className="bg-slate-100 text-slate-900 px-2 py-1 rounded-lg font-mono text-[10px] font-bold">
            {complaint.tracking_code}
          </code>
          <Badge
            className={cn(
              "px-2 py-0.5 text-[10px] uppercase font-black border-0",
              status.pill
            )}
          >
            {status.label}
          </Badge>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">
            {complaint.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px] font-medium">
            <MapPin className="h-3 w-3" /> Ward {complaint.ward?.ward_number}
            <span>•</span>
            <Tag className="h-3 w-3" /> {complaint.category?.name}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
          <LiveSLACell
            submittedAt={complaint.submitted_at}
            slaDueAt={complaint.sla_due_at}
            status={complaint.status}
          />
          <ChevronRight className="h-4 w-4 text-slate-300" />
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
            <code className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md tracking-tighter">
              {row.original.tracking_code}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.original.tracking_code);
                toast.success("ID Copied");
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Complaint Summary",
        cell: ({ row }) => (
          <div className="max-w-[300px] space-y-1">
            <p className="font-bold text-slate-900 truncate leading-tight">
              {row.original.title}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Building2 className="h-3 w-3" />
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
                "rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border shadow-none",
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
          // FIX: Assign the component to a capitalized variable
          const StatusIcon = conf.icon;

          return (
            <Badge
              className={cn(
                "gap-1.5 border-2 font-black text-[10px] uppercase shadow-sm",
                conf.pill
              )}
            >
              {/* FIX: Render as an Element, not as an object/variable */}
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
            Submitted <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-xs font-bold text-slate-600">
            {format(new Date(row.original.submitted_at), "MMM d, yyyy")}
            <span className="block text-[10px] font-medium text-slate-400">
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
                className="h-8 w-8 rounded-full hover:bg-slate-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-48">
              <DropdownMenuItem onClick={() => handleRowClick(row.original)}>
                <Eye className="mr-2 h-4 w-4" /> Open Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print Document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
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
        <div className="rounded-[2rem] border-2 border-slate-100 overflow-hidden bg-white shadow-xl shadow-slate-200/50">
          <Table>
            <TableHeader className="bg-slate-50/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="hover:bg-transparent border-b-2 border-slate-100"
                >
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="h-14 px-6 text-[11px] font-black uppercase tracking-widest text-slate-400"
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
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <AlertTriangle className="h-10 w-10 text-slate-300" />
                        <p className="font-bold text-slate-900">
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
                      className="group cursor-pointer hover:bg-blue-50/30 transition-colors border-b border-slate-50"
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
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Showing{" "}
          <span className="text-slate-900">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="text-slate-900">
            {Math.min(currentPage * pageSize, total)}
          </span>{" "}
          of <span className="text-slate-900">{total}</span> Registry Entries
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
          <div className="h-10 px-4 flex items-center justify-center bg-white border-2 border-slate-100 rounded-xl text-xs font-black">
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
      <Skeleton className="h-14 w-full rounded-[2rem]" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}