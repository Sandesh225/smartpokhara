"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  ArrowUpDown,
  Calendar,
  Eye,
  MapPin,
  MoreVertical,
  Search,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  Printer,
  FileText,
  Shield,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";
import type { Complaint, ComplaintStatus } from "@/lib/supabase/queries/complaints";

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

  /**
   * ✅ IMPORTANT: where the detail page actually lives
   * Default matches your app: /citizen/complaints/[id]
   */
  basePath?: string;
}

const statusConfig: Record<
  ComplaintStatus,
  {
    label: string;
    icon: ReactNode;
    pill: string;
  }
> = {
  received: {
    label: "Received",
    icon: <Clock className="h-3.5 w-3.5" />,
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  under_review: {
    label: "Under Review",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    pill: "bg-purple-50 text-purple-700 border-purple-200",
  },
  assigned: {
    label: "Assigned",
    icon: <Shield className="h-3.5 w-3.5" />,
    pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  in_progress: {
    label: "In Progress",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  closed: {
    label: "Closed",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    pill: "bg-slate-50 text-slate-700 border-slate-200",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-3.5 w-3.5" />,
    pill: "bg-red-50 text-red-700 border-red-200",
  },
  reopened: {
    label: "Reopened",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    pill: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const priorityConfig = {
  critical: { label: "Critical", pill: "bg-red-600 text-white" },
  urgent: { label: "Urgent", pill: "bg-red-500 text-white" },
  high: { label: "High", pill: "bg-orange-500 text-white" },
  medium: { label: "Medium", pill: "bg-amber-500 text-white" },
  low: { label: "Low", pill: "bg-slate-500 text-white" },
};

function isOverdue(slaDueAt?: string | null) {
  if (!slaDueAt) return false;
  const d = new Date(slaDueAt);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

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

  // ✅ keep table sorting UI in sync with parent URL state
  useEffect(() => {
    setSorting([{ id: sortBy, desc: sortOrder === "DESC" }]);
  }, [sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));

  const goDetails = (complaint: Complaint) => {
    if (onRowClick) return onRowClick(complaint);
    router.push(`${basePath}/${complaint.id}`);
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Tracking code copied", { description: code, duration: 2000 });
  };

  const columns: ColumnDef<Complaint>[] = useMemo(
    () => [
      {
        accessorKey: "tracking_code",
        header: () => <span className="font-semibold text-slate-900">Tracking</span>,
        cell: ({ row }) => {
          const code = row.getValue("tracking_code") as string;
          return (
            <div className="flex items-center gap-2 group">
              <code className="font-mono text-xs sm:text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                {code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyTracking(code);
                }}
                aria-label="Copy tracking code"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: () => <span className="font-semibold text-slate-900">Complaint</span>,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="min-w-0">
              <div
                className="font-semibold text-slate-900 truncate max-w-[280px]"
                title={c.title}
              >
                {c.title}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <Tag className="h-3.5 w-3.5" />
                <span className="truncate max-w-[240px]">
                  {c.category?.name || "N/A"}
                  {c.subcategory?.name ? ` → ${c.subcategory.name}` : ""}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "ward",
        header: () => <span className="font-semibold text-slate-900">Ward</span>,
        cell: ({ row }) => {
          const ward = row.original.ward;
          return (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-slate-600" />
              </span>
              <div className="leading-tight">
                <div className="font-medium">
                  {ward ? `Ward ${ward.ward_number}` : "N/A"}
                </div>
                <div className="text-xs text-slate-500 truncate max-w-[140px]">
                  {ward?.name || "—"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <span className="font-semibold text-slate-900">Status</span>,
        cell: ({ row }) => {
          const status = row.getValue("status") as ComplaintStatus;
          const conf = statusConfig[status];
          if (!conf) return null;
          return (
            <Badge className={`gap-1.5 border font-medium ${conf.pill}`}>
              {conf.icon}
              {conf.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "priority",
        header: () => <span className="font-semibold text-slate-900">Priority</span>,
        cell: ({ row }) => {
          const p = row.getValue("priority") as keyof typeof priorityConfig;
          const conf = priorityConfig[p];
          if (!conf) return null;
          return (
            <Badge className={`${conf.pill} border-0 font-semibold text-xs px-2.5 py-1`}>
              {conf.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "submitted_at",
        header: () => {
          const isActive = sortBy === "submitted_at";
          return (
            <Button
              variant="ghost"
              onClick={() => {
                const next: SortOrder = isActive && sortOrder === "ASC" ? "DESC" : "ASC";
                onSortChange?.("submitted_at", next);
              }}
              className="px-0 font-semibold hover:bg-transparent hover:text-blue-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Submitted
              <ArrowUpDown className={`ml-2 h-4 w-4 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("submitted_at"));
          return (
            <div className="text-sm font-medium text-slate-700">
              {Number.isNaN(date.getTime()) ? "—" : format(date, "MMM dd, yyyy")}
            </div>
          );
        },
      },
      {
        id: "sla",
        header: () => <span className="font-semibold text-slate-900">SLA</span>,
        cell: ({ row }) => {
          const due = (row.original as any).sla_due_at as string | null | undefined;
          if (!due) return <span className="text-sm text-slate-400">—</span>;
          const overdue = isOverdue(due);
          return (
            <div className="flex items-center gap-2">
              <Badge
                className={
                  overdue
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-slate-50 text-slate-700 border border-slate-200"
                }
              >
                {overdue ? "Overdue" : "Due"}
              </Badge>
              <span className={`text-sm ${overdue ? "text-red-700 font-semibold" : "text-slate-700"}`}>
                {format(new Date(due), "MMM dd")}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 p-0 hover:bg-slate-100"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => router.push(`${basePath}/${c.id}`)}
                  className="cursor-pointer gap-2"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                  View details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleCopyTracking(c.tracking_code)}
                  className="cursor-pointer gap-2"
                >
                  <Copy className="h-4 w-4 text-slate-600" />
                  Copy tracking code
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => window.open(`${basePath}/${c.id}`, "_blank")}
                  className="cursor-pointer gap-2"
                >
                  <Printer className="h-4 w-4 text-slate-600" />
                  Open for printing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [basePath, onSortChange, router, sortBy, sortOrder]
  );

  const table = useReactTable({
    data: complaints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const ComplaintCard = ({ complaint }: { complaint: Complaint }) => {
    const statusConf = statusConfig[complaint.status];
    const due = (complaint as any).sla_due_at as string | null | undefined;
    const overdue = isOverdue(due);

    return (
      <Card
        className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-slate-200 overflow-hidden relative"
        onClick={() => goDetails(complaint)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") goDetails(complaint);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-indigo-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-slate-900 truncate">
                {complaint.title}
              </CardTitle>

              <CardDescription className="flex items-center gap-2 flex-wrap mt-2">
                <code className="font-mono text-xs font-semibold bg-slate-100 text-slate-900 px-2 py-0.5 rounded">
                  {complaint.tracking_code}
                </code>

                <span className="text-slate-300">•</span>

                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3.5 w-3.5" />
                  Ward {complaint.ward?.ward_number || "N/A"}
                </span>

                {due && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className={`text-xs font-medium ${overdue ? "text-red-700" : "text-slate-600"}`}>
                      {overdue ? "SLA Overdue" : `SLA: ${format(new Date(due), "MMM dd")}`}
                    </span>
                  </>
                )}
              </CardDescription>
            </div>

            <Badge className={`gap-1.5 border font-medium shrink-0 ${statusConf.pill}`}>
              {statusConf.icon}
              {statusConf.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 relative">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <Tag className="h-4 w-4 text-slate-500" />
              <span className="font-medium">{complaint.category?.name || "N/A"}</span>
              {complaint.subcategory?.name ? (
                <span className="text-slate-500">→ {complaint.subcategory.name}</span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-500" />
              {format(new Date(complaint.submitted_at), "MMM dd, yyyy")}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-slate-100 bg-slate-50/60 relative">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              goDetails(complaint);
            }}
          >
            View details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // -------------------- Loading --------------------
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="hidden md:block">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50/40">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TableHead key={i} className="h-12">
                      <Skeleton className="h-5 w-24 bg-slate-200" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, r) => (
                  <TableRow key={r}>
                    {Array.from({ length: 8 }).map((__, c) => (
                      <TableCell key={c} className="py-4">
                        <Skeleton className="h-5 w-full bg-slate-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-slate-200">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-slate-200" />
                <Skeleton className="h-4 w-1/2 bg-slate-100 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-slate-100" />
                <Skeleton className="h-4 w-2/3 bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // -------------------- Empty --------------------
  if (!complaints?.length) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center mb-5 shadow-sm">
          <Search className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No complaints found</h3>
        <p className="text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          You haven’t submitted any complaints yet, or none match your current search/tab.
        </p>
        <Button
          onClick={() => router.push(`${basePath}/new`)}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
        >
          <FileText className="h-4 w-4" />
          Submit New Complaint
        </Button>
      </div>
    );
  }

  // -------------------- Normal --------------------
  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200"
                >
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="h-12 text-slate-900">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-slate-50/70 transition-colors"
                  onClick={() => goDetails(row.original)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") goDetails(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {complaints.map((c) => (
          <ComplaintCard key={c.id} complaint={c} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 space-y-4">
          <Pagination>
            <PaginationContent className="flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={`${
                    currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                  } transition-colors`}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className={`cursor-pointer transition-all ${
                        pageNum === currentPage
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
                          : "hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={`${
                    currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                  } transition-colors`}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="text-center">
            <p className="text-sm text-slate-600 bg-slate-50 inline-block px-4 py-2 rounded-full">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * pageSize, total)}
              </span>{" "}
              of <span className="font-semibold text-slate-900">{total}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
