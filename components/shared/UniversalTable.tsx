"use client";

import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  emptyTitle = "No Records Found",
  emptyMessage = "No records match your current filters.",
}: UniversalTableProps<TData>) {
  
  // --- LOADING STATE ---
  if (isLoading) {
    if (variant === "tactical") {
       return (
        <div className="flex-1 flex flex-col items-center justify-center bg-card/5 backdrop-blur-sm min-h-[400px]">
          <LoadingSpinner message="Decrypting Data Streams..." />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (table.getRowModel().rows.length === 0) {
    if (variant === "tactical") {
      return (
        <div className="flex-1 flex items-center justify-center p-12 min-h-[400px]">
          <EmptyState
            title={emptyTitle}
            message={emptyMessage}
          />
        </div>
      );
    }
     return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-card/50">
           <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
           <h3 className="text-lg font-bold text-foreground">{emptyTitle}</h3>
           <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
     );
  }

  // --- TACTICAL VARIANT (Supervisor) ---
  if (variant === "tactical") {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
             <thead className="bg-muted/40 backdrop-blur-xl sticky top-0 z-20">
               {table.getHeaderGroups().map(headerGroup => (
                 <tr key={headerGroup.id}>
                   {headerGroup.headers.map(header => (
                     <th key={header.id} className="px-4 py-5 border-b border-border/60 first:pl-6 last:pr-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                     </th>
                   ))}
                 </tr>
               ))}
             </thead>
             <tbody className="divide-y divide-border/20">
               {table.getRowModel().rows.map(row => (
                 <TableRow 
                    key={row.id}
                    className={cn(
                      "group transition-all duration-300 hover:bg-primary/3 border-border/20",
                      row.getIsSelected() && "bg-primary/5"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                 >
                   {row.getVisibleCells().map(cell => (
                     <TableCell key={cell.id} className="px-4 py-4 first:pl-6 last:pr-6 align-middle">
                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                     </TableCell>
                   ))}
                 </TableRow>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- DEFAULT VARIANT (Admin / Citizen) ---
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-12 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={cn(
                  "cursor-pointer hover:bg-muted/30 transition-colors",
                  row.getIsSelected() && "bg-primary/5"
              )}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
