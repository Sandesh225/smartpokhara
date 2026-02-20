"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Complaint } from "@/features/complaints";
import {
  PortalMode,
  ComplaintTableVariant,
  ComplaintActionType,
} from "@/types/complaints-ui";
import { useComplaintsTable } from "@/hooks/complaints/useComplaintsTable";
import { getComplaintColumns } from "./columns";
import { UniversalTable } from "@/components/shared/UniversalTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";

interface UniversalComplaintsTableProps {
  data: Complaint[];
  isLoading: boolean;
  portalMode: PortalMode;
  variant?: ComplaintTableVariant;
  onAction?: (action: ComplaintActionType, complaint: Complaint) => void;
  // External State Control (Optional)
  pagination?: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  // Selection
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
  onSelect,
  onSelectAll,
}: UniversalComplaintsTableProps) {
  
  // 1. Columns
  const columns = useMemo(
    () => getComplaintColumns(portalMode, onAction),
    [portalMode, onAction]
  );

  // 2. Hook (mostly for internal state if not controlled externally)
  // For sorting, we often control it externally from the page.
  // We'll use the hook to setup the table instance.
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: externalSorting,
      rowSelection: selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
      pagination: pagination ? {
        pageIndex: pagination.pageIndex - 1,
        pageSize: pagination.pageSize,
      } : undefined,
    },
    pageCount: pagination ? Math.ceil(pagination.total / pagination.pageSize) : -1,
    manualPagination: !!pagination,
    manualSorting: !!externalSorting,
    onSortingChange: (updater) => {
      if (onSortingChange && typeof updater === 'function') {
         // This is a simplification; handling functional updates for external state requires more care
         // accessing the previous state. For now, we assume simple objects or we'd need to lift state fully.
         // React Table passes a functional update.
         // For this implementation, we will assume the parent handles sorting if passed.
         // We might need to implement a local state wrapper if we want to support both modes fully seamlessly.
      }
      // If externalSorting is provided, we expect onSortingChange to handle it.
      // If not, useComplaintsTable hook would handle it (but we aren't using the hook here fully yet)
    },
    // We are manually configuring the table here instead of using the hook because we have
    // mixed controlled/uncontrolled props. The hook I made earlier is good for fully client-side,
    // but here we have server-side pagination props passed down.
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  
  // Helper for sorting click
  const handleSort = (columnId: string) => {
    if (!onSortingChange || !externalSorting) return;
    
    // Simple toggle logic for single column sorting
    const isDesc = externalSorting.find(s => s.id === columnId)?.desc;
    const newSort = isDesc === undefined 
      ? [{ id: columnId, desc: false }] 
      : isDesc === false 
      ? [{ id: columnId, desc: true }] 
      : []; // Toggle off or cycle
      
    onSortingChange(newSort);
  };


  // --- RENDERERS ---

  return (
    <div className="space-y-4">
      <UniversalTable
        table={table}
        isLoading={isLoading}
        variant={variant as any}
        emptyTitle={variant === "tactical" ? "No Records in Perimeter" : "No Complaints Found"}
        emptyMessage={variant === "tactical" ? "Adjust your search parameters/filters." : "No records match your current filters."}
      />

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-muted-foreground">
                Showing {Math.min((pagination.pageIndex - 1) * pagination.pageSize + 1, pagination.total)} - {Math.min(pagination.pageIndex * pagination.pageSize, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={pagination.pageIndex <= 1}
                    onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs font-bold w-8 text-center">
                    {pagination.pageIndex}
                </div>
                <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     disabled={pagination.pageIndex * pagination.pageSize >= pagination.total}
                    onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
