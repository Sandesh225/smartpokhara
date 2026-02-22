"use client";

import { useMemo } from "react";
import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Complaint } from "@/features/complaints";
import { PortalMode, ComplaintTableVariant, ComplaintActionType } from "@/types/complaints-ui";
import { getComplaintColumns } from "./columns";
import { UniversalTable } from "@/components/shared/UniversalTable";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface UniversalComplaintsTableProps {
  data: Complaint[];
  isLoading: boolean;
  portalMode: PortalMode;
  variant?: ComplaintTableVariant;
  onAction?: (action: ComplaintActionType, complaint: Complaint) => void;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export function UniversalComplaintsTable({
  data,
  isLoading,
  portalMode,
  variant = "default",
  onAction,
  pagination,
  sorting: externalSorting,
  onSortingChange,
  selectedIds = [],
}: UniversalComplaintsTableProps) {

  const columns = useMemo(
    () => getComplaintColumns(portalMode, onAction),
    [portalMode, onAction]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: externalSorting,
      rowSelection: selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
      ...(pagination && {
        pagination: {
          pageIndex: pagination.pageIndex - 1,
          pageSize:  pagination.pageSize,
        },
      }),
    },
    pageCount:        pagination ? Math.ceil(pagination.total / pagination.pageSize) : -1,
    manualPagination: !!pagination,
    manualSorting:    !!externalSorting,
    onSortingChange:  () => {},
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ── Pagination maths ──────────────────────────────────────────────────────
  const total      = pagination?.total ?? 0;
  const pageIndex  = pagination?.pageIndex ?? 1;
  const pageSize   = pagination?.pageSize ?? 10;
  const totalPages = pagination ? Math.ceil(total / pageSize) : 1;
  const from       = total ? (pageIndex - 1) * pageSize + 1 : 0;
  const to         = Math.min(pageIndex * pageSize, total);
  const hasPrev    = pageIndex > 1;
  const hasNext    = pageIndex < totalPages;

  // Smart page number list: 1 … cur-1 cur cur+1 … last
  const pageNumbers = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (pageIndex > 3)  pages.push("…");
    for (let p = Math.max(2, pageIndex - 1); p <= Math.min(totalPages - 1, pageIndex + 1); p++) pages.push(p);
    if (pageIndex < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col w-full h-full animate-fade-in">
      <UniversalTable
        table={table}
        isLoading={isLoading}
        variant={variant as any}
        emptyTitle={variant === "tactical" ? "No Records Found" : "No Complaints Found"}
        emptyMessage="Try adjusting your search or filters."
      />

      {/* ── Pagination bar ── */}
      {pagination && total > 0 && (
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/20">

          {/* Record range */}
          <p className="text-sm font-sans text-muted-foreground flex-shrink-0 text-center sm:text-left">
            Showing <span className="font-heading font-bold text-foreground">{from}</span> to <span className="font-heading font-bold text-foreground">{to}</span> of{" "}
            <span className="font-heading font-bold text-foreground">{total.toLocaleString()}</span> records
          </p>

          {/* Page controls */}
          <div className="flex items-center gap-1.5">

            {/* Prev */}
            <button
              onClick={() => pagination.onPageChange(pageIndex - 1)}
              disabled={!hasPrev}
              aria-label="Previous page"
              className={cn(
                "w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20",
                hasPrev
                  ? "border-border bg-card text-foreground hover:bg-accent/40 hover:text-accent-foreground hover:border-primary/40 active:scale-95 shadow-sm"
                  : "border-border/30 bg-transparent text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            {pageNumbers().map((pg, i) =>
              pg === "…" ? (
                <div
                  key={`ellipsis-${i}`}
                  className="w-9 h-9 flex items-center justify-center text-muted-foreground select-none"
                >
                  <MoreHorizontal className="w-4 h-4 opacity-50" />
                </div>
              ) : (
                <button
                  key={pg}
                  onClick={() => pagination.onPageChange(pg as number)}
                  aria-label={`Page ${pg}`}
                  aria-current={pg === pageIndex ? "page" : undefined}
                  className={cn(
                    "w-9 h-9 rounded-xl text-sm font-heading font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    pg === pageIndex
                      ? "bg-primary text-primary-foreground border border-primary shadow-md shadow-primary/20 scale-105"
                      : "border border-border bg-card text-foreground hover:bg-accent/40 hover:text-accent-foreground hover:border-primary/30 active:scale-95 shadow-sm"
                  )}
                >
                  {pg}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => pagination.onPageChange(pageIndex + 1)}
              disabled={!hasNext}
              aria-label="Next page"
              className={cn(
                "w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20",
                hasNext
                  ? "border-border bg-card text-foreground hover:bg-accent/40 hover:text-accent-foreground hover:border-primary/40 active:scale-95 shadow-sm"
                  : "border-border/30 bg-transparent text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}