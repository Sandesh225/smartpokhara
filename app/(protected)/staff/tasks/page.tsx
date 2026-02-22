"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import { UniversalTaskTable } from "@/components/staff/shared/UniversalTaskTable";
import { LayoutGrid, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Task = any; // Simplified for build fix, should use ProjectTask type from features/tasks

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  const supabase = createClient();

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting current user:", error);
        return;
      }
      setUserId(data.user?.id ?? null);
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load tasks for that user
  useEffect(() => {
    if (!userId) return;
    loadTasks(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, userId]);

  async function loadTasks(currentUserId: string) {
    setLoading(true);

    try {
      let query = supabase
        .from("supervisor_tasks")
        .select(
          `
          *,
          related_complaint:complaints(tracking_code, title),
          assignee:users!supervisor_tasks_primary_assigned_to_fkey(profile:user_profiles(full_name)),
          ward:wards(ward_number, name),
          assigned_department:departments(name)
        `
        )
        .eq("primary_assigned_to", currentUserId) // 👈 only my tasks
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="mt-2 text-sm text-gray-600">
            Could not determine current user.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="mt-2 text-sm text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <LayoutGrid className="w-5 h-5" />
          </div>
          My Task Board
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 pl-0.5">
          Manage and track your assigned tasks and assignments.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 bg-muted/50 border-border focus:bg-card transition-all placeholder:text-xs placeholder:font-bold placeholder:uppercase placeholder:tracking-widest h-10 rounded-xl"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
            <SelectTrigger className="w-full md:w-40 bg-muted/50 border-border h-10 rounded-xl text-xs font-bold uppercase tracking-widest">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border shadow-xl">
              <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">All Status</SelectItem>
              <SelectItem value="pending" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">Pending</SelectItem>
              <SelectItem value="in_progress" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">In Progress</SelectItem>
              <SelectItem value="completed" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(val) => setFilters(prev => ({ ...prev, priority: val }))}>
            <SelectTrigger className="w-full md:w-40 bg-muted/50 border-border h-10 rounded-xl text-xs font-bold uppercase tracking-widest">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border shadow-xl">
              <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">All Priority</SelectItem>
              <SelectItem value="high" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">High</SelectItem>
              <SelectItem value="medium" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">Medium</SelectItem>
              <SelectItem value="low" className="text-xs font-bold uppercase tracking-widest focus:bg-primary/10 accent-primary">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      <UniversalTaskTable 
        data={tasks} 
        isLoading={loading}
        onTaskUpdate={() => loadTasks(userId)} 
      />
    </div>
  );
}
