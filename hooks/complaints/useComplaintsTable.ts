"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  RowSelectionState,
  ColumnDef,
  Table,
} from "@tanstack/react-table";
import { Complaint } from "@/features/complaints";
import { PortalMode } from "@/types/complaints-ui";

interface UseComplaintsTableProps {
  data: Complaint[];
  columns: ColumnDef<Complaint, any>[];
  initialState?: {
    pagination?: {
      pageIndex: number;
      pageSize: number;
    };
    sorting?: SortingState;
  };
  enableRowSelection?: boolean;
}

export function useComplaintsTable({
  data,
  columns,
  initialState,
  enableRowSelection = false,
}: UseComplaintsTableProps) {
  const [sorting, setSorting] = useState<SortingState>(initialState?.sorting || []);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  // Pagination state is often managed by the server in this app (implied by existing code),
  // but if we need client-side pagination for some smaller lists, we can use this.
  // For server-side pagination, the 'data' prop usually changes, and we might not use the table's internal pagination model for fetching.
  // However, the table instance still needs to know about page size/index for display if we pass manualPagination: true.
  
  // For now, we will assume standard client-side features OR that the parent controls data slicing.
  // If the parent controls data (server-side), we should pass `manualPagination: true` and `pageCount`.
  // To keep it simple for the "Foundation" step, i'll set up the state structure.
  
  const [pagination, setPagination] = useState({
    pageIndex: initialState?.pagination?.pageIndex || 0,
    pageSize: initialState?.pagination?.pageSize || 20,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      pagination,
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // We can enable manual pagination later if we pass it as a prop
    // manualPagination: true, 
  });

  const getSelectedIds = useCallback(() => {
    return Object.keys(rowSelection).filter((key) => rowSelection[key]);
  }, [rowSelection]);

  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  return {
    table,
    sorting,
    rowSelection,
    pagination,
    setSorting,
    setRowSelection,
    setPagination,
    getSelectedIds,
    clearSelection,
  };
}
