"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { tasksApi } from "../api";
import { TaskFilters, ProjectTask } from "../types";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  lists: () => [...TASK_KEYS.all, "list"] as const,
  list: (filters: TaskFilters) => [...TASK_KEYS.lists(), filters] as const,
  details: () => [...TASK_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const,
  assignments: (userId: string) => [...TASK_KEYS.all, "assignments", userId] as const,
};

export function useTasks(filters: TaskFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: TASK_KEYS.list(filters),
    queryFn: () => tasksApi.getTasks(supabase, filters),
  });
}

export function useTask(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => tasksApi.getTaskById(supabase, id),
    enabled: !!id,
  });
}

export function useMyAssignments(userId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: TASK_KEYS.assignments(userId || ""),
    queryFn: () => (userId ? tasksApi.getStaffAssignments(supabase, userId) : []),
    enabled: !!userId,
  });
}

export function useTaskMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: (input: Partial<ProjectTask>) => tasksApi.createTask(supabase, input),
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to create task"),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProjectTask> }) =>
      tasksApi.updateTask(supabase, id, updates),
    onSuccess: () => {
      toast.success("Task updated");
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to update task"),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(supabase, id),
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete task"),
  });

  const addComment = useMutation({
    mutationFn: ({ taskId, content, isPrivate }: { taskId: string; content: string; isPrivate?: boolean }) =>
      tasksApi.addComment(supabase, taskId, content, isPrivate),
    onSuccess: () => {
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to add comment"),
  });

  const assignTask = useMutation({
    mutationFn: ({ taskId, staffId }: { taskId: string; staffId: string }) =>
      tasksApi.assignTask(supabase, taskId, staffId),
    onSuccess: () => {
      toast.success("Task assigned");
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
    onError: (error: any) => toast.error(error.message || "Failed to assign task"),
  });

  return {
    createTask,
    updateTask,
    deleteTask,
    addComment,
    assignTask,
  };
}

export function useOverdueTasksCount() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["tasks", "overdue", "count"],
    queryFn: () => tasksApi.getOverdueTasksCount(supabase),
  });
}
