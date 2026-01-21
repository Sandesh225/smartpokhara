// ═══════════════════════════════════════════════════════════
// TASKS PAGE - Main List View
// ═══════════════════════════════════════════════════════════

"use client";
import { useTaskManagement } from "@/hooks/admin/useTaskManagement";
import { TasksTable } from "./_components/TasksTable";
import { OverdueTasksAlert } from "./_components/OverdueTasksAlert";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function TasksPage() {
  const { tasks, overdueCount, filters, setFilters, updateStatus, deleteItem } =
    useTaskManagement();

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* OVERDUE ALERT */}
      <OverdueTasksAlert
        count={overdueCount}
        onViewAll={() =>
          setFilters((prev) => ({ ...prev, showOverdueOnly: true }))
        }
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tighter">
          Task Board
        </h1>
        <Button asChild size="sm" className="self-start sm:self-auto">
          <Link href="/admin/tasks/create">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create Task</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="stone-card p-3 md:p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* TASKS TABLE */}
      <TasksTable
        data={tasks}
        onStatusChange={updateStatus}
        onDelete={deleteItem}
      />
    </div>
  );
}
