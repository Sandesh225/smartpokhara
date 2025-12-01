"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import { TaskTable } from "@/components/staff/TaskTable";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  related_complaint?: { tracking_code: string; title: string };
  assigned_to_user?: { user_profiles: { full_name: string } };
  wards?: { ward_number: number; name: string };
  assigned_department?: { name: string };
};

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
        .from("tasks")
        .select(
          `
          *,
          related_complaint:complaints(tracking_code, title),
          assigned_to_user:users(user_profiles(full_name)),
          wards(ward_number, name),
          assigned_department:departments(name)
        `
        )
        .eq("assigned_to_user_id", currentUserId) // 👈 only my tasks
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
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage tasks assigned to you by admin/supervisors.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search tasks..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Priority
            </label>
            <select
              id="priority"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({ status: "", priority: "", search: "" })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <TaskTable tasks={tasks} onTaskUpdate={() => loadTasks(userId)} />
    </div>
  );
}
