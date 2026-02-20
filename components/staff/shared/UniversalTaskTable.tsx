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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="space-y-4">
      <UniversalTable
        table={table}
        isLoading={isLoading}
        emptyTitle="No Tasks Assigned"
        emptyMessage="You currently have no tasks assigned to you."
      />
    </div>
  );
}
