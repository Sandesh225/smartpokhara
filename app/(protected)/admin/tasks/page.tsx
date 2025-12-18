"use client";
import { useTaskManagement } from "@/hooks/admin/useTaskManagement";
import { TasksTable } from "./_components/TasksTable";
import { OverdueTasksAlert } from "./_components/OverdueTasksAlert";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function TasksPage() {
  const { tasks, overdueCount, filters, setFilters, updateStatus, deleteItem } = useTaskManagement();

  return (
    <div className="space-y-6">
       <OverdueTasksAlert count={overdueCount} onViewAll={() => console.log('filter overdue')} />

       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <Button asChild>
             <Link href="/admin/tasks/create"><Plus className="mr-2 h-4 w-4"/> Create Task</Link>
          </Button>
       </div>

       <div className="bg-white p-4 rounded-lg border">
          <Input 
             placeholder="Search tasks..." 
             value={filters.search} 
             onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
             className="max-w-sm"
          />
       </div>

       <TasksTable data={tasks} onStatusChange={updateStatus} onDelete={deleteItem} />
    </div>
  );
}