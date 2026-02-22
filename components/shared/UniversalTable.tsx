"use client";

import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";

export type UniversalTableVariant = "default" | "tactical";

interface UniversalTableProps<TData> {
  table: ReactTable<TData>;
  isLoading?: boolean;
  variant?: UniversalTableVariant;
  onRowClick?: (row: TData) => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function UniversalTable<TData>({
  table,
  isLoading = false,
  variant = "default",
  onRowClick,
  emptyTitle   = "No Records Found",
  emptyMessage = "No records match your current filters.",
}: UniversalTableProps<TData>) {

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    if (variant === "tactical") {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner message="Loading data…" />
        </div>
      );
    }
    return (
      <div className="space-y-2 p-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-14 w-full rounded-xl"
            style={{ opacity: 1 - i * 0.15 } as React.CSSProperties}
          />
        ))}
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (table.getRowModel().rows.length === 0) {
    if (variant === "tactical") {
      return (
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <EmptyState title={emptyTitle} message={emptyMessage} />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-border/50 rounded-2xl m-5">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">{emptyMessage}</p>
      </div>
    );
  }

  // ── Tactical variant ──────────────────────────────────────────────────────
  if (variant === "tactical") {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-separate border-spacing-0">

            {/* Header */}
            <thead className="sticky top-0 z-20 bg-muted/60 backdrop-blur-sm">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      className="px-5 py-3.5 border-b border-border first:pl-6 last:pr-6
                        text-sm font-bold uppercase tracking-widest text-muted-foreground
                        whitespace-nowrap select-none"
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Body */}
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-b border-border/30 transition-colors duration-150",
                    onRowClick && "cursor-pointer hover:bg-accent/50",
                    row.getIsSelected() && "bg-accent"
                  )}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-5 py-4 first:pl-6 last:pr-6 align-middle
                        text-sm font-medium text-foreground"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    );
  }

  // ── Default variant ───────────────────────────────────────────────────────
  return (
    <Table>

      {/* Column headers */}
      <TableHeader>
        {table.getHeaderGroups().map(hg => (
          <TableRow
            key={hg.id}
            className="hover:bg-transparent border-b border-border bg-muted/30"
          >
            {hg.headers.map(h => (
              <TableHead
                key={h.id}
                className="h-11 px-5
                  text-sm font-bold uppercase tracking-widest
                  text-muted-foreground whitespace-nowrap select-none"
              >
                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      {/* Rows */}
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
            onClick={() => onRowClick?.(row.original)}
            className={cn(
              "border-b border-border/40 last:border-0 transition-colors duration-150",
              onRowClick && "cursor-pointer hover:bg-muted/40",
              row.getIsSelected() && "bg-accent"
            )}
          >
            {row.getVisibleCells().map(cell => (
              <TableCell
                key={cell.id}
                className="px-5 py-4
                  text-sm font-medium text-foreground
                  align-middle"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>

    </Table>
  );
}