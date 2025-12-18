"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminTaskQueries } from "@/lib/supabase/queries/admin/tasks";
import { subscribeToTasks } from "@/lib/supabase/realtime/admin/tasks-subscription";
import { AdminTask, TaskFiltersState, CreateTaskInput } from "@/types/admin-tasks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useTaskManagement() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [overdueCount, setOverdueCount] = useState(0);
  const [filters, setFilters] = useState<TaskFiltersState>({
    search: "",
    status: [],
    priority: [],
    assignee_id: null,
    date_range: { from: null, to: null }
  });

  const supabase = createClient();
  const router = useRouter();

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminTaskQueries.getAllTasks(supabase, filters);
      setTasks(data);
      
      // Fetch overdue count
      const count = await adminTaskQueries.getOverdueTasks(supabase);
      setOverdueCount(count);
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters, supabase]);

  // Initial Fetch & Realtime
  useEffect(() => {
    fetchTasks();
    const channel = subscribeToTasks(supabase, fetchTasks);
    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks, supabase]);

  // Mutations
  const createTask = async (input: CreateTaskInput) => {
      try {
          await adminTaskQueries.createTask(supabase, input);
          toast.success("Task created successfully");
          router.push("/admin/tasks");
      } catch(e: any) {
          console.error("Create Task Error:", e);
          toast.error(e.message || "Failed to create task");
      }
  };

  const updateStatus = async (id: string, status: any) => {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      try {
          await adminTaskQueries.updateTask(supabase, id, { status });
      } catch(e) {
          toast.error("Failed to update status");
          fetchTasks(); // Revert
      }
  };

  const addComment = async (id: string, content: string) => {
      await adminTaskQueries.addComment(supabase, id, content);
      // Invalidation handled by page or realtime
  };

  const deleteItem = async (id: string) => {
      if(!confirm("Are you sure?")) return;
      try {
          await adminTaskQueries.deleteTask(supabase, id);
          toast.success("Task deleted");
          fetchTasks();
      } catch(e) {
          toast.error("Deletion failed");
      }
  };

  return {
    tasks,
    loading,
    overdueCount,
    filters,
    setFilters,
    refresh: fetchTasks,
    createTask,
    updateStatus,
    addComment,
    deleteItem
  };
}