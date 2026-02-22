"use client";

import { useMemo } from "react";
import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Task, getTaskColumns } from "./task-columns";
import { UniversalTable } from "@/components/shared/UniversalTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface UniversalTaskTableProps {
  data: Task[];
  isLoading: boolean;
  onTaskUpdate?: () => void;
}

export function UniversalTaskTable({
  data,
  isLoading,
  onTaskUpdate,
}: UniversalTaskTableProps) {
  
  const columns = useMemo(() => getTaskColumns(), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      <UniversalTable
        table={table}
        isLoading={isLoading}
        emptyTitle="No Tasks Found"
        emptyMessage="You're all caught up for now!"
      />
    </div>
  );
}
