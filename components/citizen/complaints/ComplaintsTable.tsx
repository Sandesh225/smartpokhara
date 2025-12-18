"use client";

import { useEffect, useMemo, useState, memo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";

import {
  ArrowUpDown,
  Calendar,
  Eye,
  MapPin,
  MoreVertical,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  Printer,
  Shield,
  Check,
} from "lucide-react";

import { toast } from "sonner";
import type {
  Complaint,
  ComplaintStatus,
} from "@/lib/supabase/queries/complaints";

type SortOrder = "ASC" | "DESC";

interface ComplaintsTableProps {
  complaints: Complaint[];
  total: number;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: SortOrder) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  onRowClick?: (complaint: Complaint) => void;
  basePath?: string;
}

// --- CONFIGURATIONS ---

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  {
    label: string;
    icon: ReactNode;
    pill: string;
    ariaLabel: string;
  }
> = {
  received: {
    label: "Received",
    icon: <Clock className="h-3.5 w-3.5" />,
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    ariaLabel: "Status: Received",
  },
  under_review: {
    label: "Under Review",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    pill: "bg-purple-50 text-purple-700 border-purple-200",
    ariaLabel: "Status: Under Review",
  },
  assigned: {
    label: "Assigned",
    icon: <Shield className="h-3.5 w-3.5" />,
    pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ariaLabel: "Status: Assigned",
  },
  in_progress: {
    label: "In Progress",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    ariaLabel: "Status: In Progress",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ariaLabel: "Status: Resolved",
  },
  closed: {
    label: "Closed",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    pill: "bg-slate-50 text-slate-700 border-slate-200",
    ariaLabel: "Status: Closed",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-3.5 w-3.5" />,
    pill: "bg-red-50 text-red-700 border-red-200",
    ariaLabel: "Status: Rejected",
  },
  reopened: {
    label: "Reopened",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    pill: "bg-orange-50 text-orange-700 border-orange-200",
    ariaLabel: "Status: Reopened",
  },
};

// --- HELPER COMPONENTS ---

// 1. Live SLA Cell Component (Fixes Static Time Issue)
const LiveSLACell = ({ submittedAt, slaDueAt, status }: { submittedAt: string, slaDueAt: string | null, status: string }) => {
    const [now, setNow] = useState(Date.now());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    // 1. Handle Missing SLA
    if (!slaDueAt) return <span className="text-slate-400 text-xs">—</span>;

    // 2. Handle Resolved/Closed/Rejected (Stop Timer)
    if (['resolved', 'closed', 'rejected'].includes(status)) {
        return (
            <div className="w-[140px] space-y-1.5">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-600 font-medium">Completed</span>
                    <span className="text-slate-400">100%</span>
                 </div>
                 <Progress value={100} className="h-2 [&>div]:bg-emerald-500" />
            </div>
        );
    }

    // 3. Calculate Live Progress
    const start = new Date(submittedAt).getTime();
    const end = new Date(slaDueAt).getTime();
    
    // Prevent division by zero if start == end
    const totalDuration = Math.max(end - start, 1); 
    const elapsed = now - start;
    
    // Clamp between 0 and 100
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    const isOverdue = now > end;

    // Format remaining time nicely
    let timeLabel = "";
    if (isOverdue) {
        const days = differenceInDays(now, end);
        timeLabel = days > 0 ? `${days}d overdue` : "Overdue";
    } else {
        const days = differenceInDays(end, now);
        const hours = differenceInHours(end, now) % 24;
        
        if (days > 0) timeLabel = `${days}d ${hours}h left`;
        else if (hours > 0) timeLabel = `${hours}h left`;
        else timeLabel = `${differenceInMinutes(end, now) % 60}m left`;
    }

    return (
        <div className="w-[140px] space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className={isOverdue ? "text-red-600 font-bold" : "text-slate-600 font-medium"}>
                    {timeLabel}
                </span>
                <span className="text-slate-400 text-[10px]">
                    {format(new Date(slaDueAt), "MMM dd")}
                </span>
            </div>
            <Progress
                value={progress}
                className={`h-2 ${isOverdue ? "[&>div]:bg-red-500 bg-red-100" : "[&>div]:bg-blue-500 bg-blue-100"}`}
            />
        </div>
    );
};

// 2. Memoized Card Component (Mobile View)
const ComplaintCard = memo(
  ({
    complaint,
    onNavigate,
  }: {
    complaint: Complaint;
    onNavigate: (complaint: Complaint) => void;
  }) => {
    const statusConf = STATUS_CONFIG[complaint.status];

    return (
      <Card
        className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-slate-200 overflow-hidden relative"
        onClick={() => onNavigate(complaint)}
        role="button"
        tabIndex={0}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-indigo-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`gap-1.5 border font-medium ${statusConf.pill}`}>
            {statusConf.icon}
            <span className="hidden sm:inline">{statusConf.label}</span>
          </Badge>
        </div>

        <CardHeader className="pb-3 relative pt-6">
          <div className="min-w-0 pr-20">
            <CardTitle className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug">
              {complaint.title}
            </CardTitle>

            <CardDescription className="flex items-center gap-2 flex-wrap mt-2">
              <code
                className="font-mono text-xs font-semibold bg-slate-100 text-slate-900 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200 transition-colors"
                onClick={(e) => {
                   e.stopPropagation();
                   navigator.clipboard.writeText(complaint.tracking_code);
                   toast.success("Copied");
                }}
              >
                {complaint.tracking_code}
              </code>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="h-3.5 w-3.5" />
                Ward {complaint.ward?.ward_number || "N/A"}
              </span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 relative">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                <Tag className="h-4 w-4 text-slate-500" />
                <span className="font-medium">
                  {complaint.category?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-slate-500" />
                {format(new Date(complaint.submitted_at), "MMM dd")}
              </div>
            </div>

            {/* SLA Progress */}
            <div className="space-y-1 pt-2">
                <LiveSLACell 
                    submittedAt={complaint.submitted_at}
                    slaDueAt={complaint.sla_due_at}
                    status={complaint.status}
                />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ComplaintCard.displayName = "ComplaintCard";


// ============================================
// MAIN COMPONENT
// ============================================

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
}: ComplaintsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortBy, desc: sortOrder === "DESC" },
  ]);

  useEffect(() => {
    setSorting([{ id: sortBy, desc: sortOrder === "DESC" }]);
  }, [sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));

  const navigateToDetails = useMemo(
    () => (complaint: Complaint) => {
      if (onRowClick) return onRowClick(complaint);
      router.push(`${basePath}/${complaint.id}`);
    },
    [onRowClick, router, basePath]
  );

  const columns: ColumnDef<Complaint>[] = useMemo(
    () => [
      {
        accessorKey: "tracking_code",
        header: () => (
          <span className="font-semibold text-slate-900">Tracking</span>
        ),
        cell: ({ row }) => {
          const code = row.getValue("tracking_code") as string;
          return (
            <div className="flex items-center gap-2 group/copy">
              <code className="font-mono text-xs sm:text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                {code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover/copy:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(code);
                    toast.success("Copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: () => (
          <span className="font-semibold text-slate-900">Complaint</span>
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <div
              className="font-semibold text-slate-900 truncate max-w-[280px]"
              title={row.original.title}
            >
              {row.original.title}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <Tag className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">
                {row.original.category?.name || "N/A"}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => (
          <span className="font-semibold text-slate-900">Status</span>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as ComplaintStatus;
          const conf = STATUS_CONFIG[status];
          return (
            <Badge className={`gap-1.5 border font-medium ${conf.pill}`}>
              {conf.icon}
              {conf.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "submitted_at",
        header: () => (
          <Button
            variant="ghost"
            onClick={() =>
              onSortChange?.(
                "submitted_at",
                sortOrder === "ASC" ? "DESC" : "ASC"
              )
            }
            className="px-0 font-semibold hover:bg-transparent hover:text-blue-700"
          >
            Submitted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm font-medium text-slate-700">
            {format(new Date(row.getValue("submitted_at")), "MMM dd, yyyy")}
          </div>
        ),
      },
      {
        id: "sla",
        header: () => (
          <span className="font-semibold text-slate-900">SLA Status</span>
        ),
        cell: ({ row }) => {
          return (
            <LiveSLACell 
                submittedAt={row.original.submitted_at}
                slaDueAt={row.original.sla_due_at}
                status={row.original.status}
            />
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`${basePath}/${row.original.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(row.original.tracking_code);
                    toast.success("Tracking code copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Tracking
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  window.open(`${basePath}/${row.original.id}`, "_blank")
                }
              >
                <Printer className="mr-2 h-4 w-4" /> Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [basePath, onSortChange, router, sortOrder]
  );

  const table = useReactTable({
    data: complaints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Simple skeleton loader */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-gradient-to-r from-slate-50 to-blue-50/40"
                >
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="h-12 text-slate-900">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                 <TableRow>
                     <TableCell colSpan={columns.length} className="h-32 text-center text-gray-500">
                         No complaints found.
                     </TableCell>
                 </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    onClick={() => navigateToDetails(row.original)}
                    className="cursor-pointer hover:bg-slate-50/70"
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {complaints.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-dashed">
                No complaints found.
            </div>
        ) : (
            complaints.map((c) => (
            <ComplaintCard
                key={c.id}
                complaint={c}
                onNavigate={navigateToDetails}
            />
            ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm px-4">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}