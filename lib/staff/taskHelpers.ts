// lib/staff/taskHelpers.ts
import { createClient } from "@/lib/supabase/client";

export async function assignTask(taskId: string, userId: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from("tasks")
    .update({ 
      assigned_to_user_id: userId,
      status: "open",
      updated_at: new Date().toISOString()
    })
    .eq("id", taskId);

  if (error) throw error;

  // Log activity
  await supabase.from("task_activity_logs").insert({
    task_id: taskId,
    user_id: user?.id,
    action: "assigned",
    details: { assigned_to: userId }
  });

  return true;
}

export async function createTaskFromComplaint(
  complaintId: string,
  taskData: {
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "critical";
    due_date?: string;
    assigned_to_user_id?: string;
    assigned_department_id?: string;
  }
) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...taskData,
      related_complaint_id: complaintId,
      assigned_by_user_id: user?.id,
      status: "open"
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("task_activity_logs").insert({
    task_id: data.id,
    user_id: user?.id,
    action: "created",
    details: { complaint_id: complaintId }
  });

  return data;
}

export async function bulkUpdateTaskStatus(
  taskIds: string[],
  newStatus: string
) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("tasks")
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .in("id", taskIds);

  if (error) throw error;

  return true;
}