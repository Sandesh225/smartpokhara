import { SupabaseClient } from "@supabase/supabase-js";
import { AdminTask, CreateTaskInput, TaskFiltersState, TaskComment } from "@/types/admin-tasks";

export const adminTaskQueries = {
  /**
   * Fetch all tasks with filtering
   */
  async getAllTasks(
    client: SupabaseClient,
    filters: TaskFiltersState,
    page = 1,
    pageSize = 20
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = client
      .from("supervisor_tasks")
      .select(`
        *,
        assignee:users!supervisor_tasks_primary_assigned_to_fkey(
          email,
          profile:user_profiles(full_name, profile_photo_url),
          staff_profile:staff_profiles(staff_code)
        ),
        ward:wards(ward_number, name),
        supervisor:supervisor_profiles(
            user:users(
                profile:user_profiles(full_name)
            )
        )
      `, { count: "exact" });

    // Apply Filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`);
    }
    if (filters.status.length > 0) {
      query = query.in("status", filters.status);
    }
    if (filters.priority.length > 0) {
      query = query.in("priority", filters.priority);
    }
    if (filters.assignee_id) {
      query = query.eq("primary_assigned_to", filters.assignee_id);
    }
    if (filters.date_range.from) {
      query = query.gte("due_date", filters.date_range.from.toISOString());
    }
    if (filters.date_range.to) {
      query = query.lte("due_date", filters.date_range.to.toISOString());
    }

    // Sorting: Critical/Overdue first
    query = query
      .order("priority", { ascending: false }) // Critical first (assuming enum order)
      .order("due_date", { ascending: true })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Normalize Data
    const tasks: AdminTask[] = (data || []).map((t: any) => ({
      ...t,
      assignee: t.assignee ? {
        full_name: t.assignee.profile?.full_name || "Unknown",
        avatar_url: t.assignee.profile?.profile_photo_url,
        email: t.assignee.email,
        staff_code: t.assignee.staff_profile?.staff_code
      } : null,
      supervisor: t.supervisor ? {
          full_name: t.supervisor.user?.profile?.full_name || "Admin"
      } : null
    }));

    return { data: tasks, count: count || 0 };
  },

  /**
   * Fetch single task details
   */
  async getTaskById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("supervisor_tasks")
      .select(`
        *,
        assignee:users!supervisor_tasks_primary_assigned_to_fkey(
          id, email,
          profile:user_profiles(full_name, profile_photo_url),
          staff_profile:staff_profiles(staff_code)
        ),
        ward:wards(id, ward_number, name),
        checklist:task_checklist_items(*),
        comments:internal_notes(
            id, content, created_at, is_private,
            author:users!internal_notes_supervisor_id_fkey(
                profile:user_profiles(full_name, profile_photo_url)
            )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    
    // Normalize comments
    const comments: TaskComment[] = (data.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        is_private: c.is_private,
        author: {
            full_name: c.author?.profile?.full_name || "Unknown",
            avatar_url: c.author?.profile?.profile_photo_url
        }
    }));

    // Normalize Task
    const task: AdminTask & { checklist: any[], comments: TaskComment[] } = {
        ...data,
        assignee: data.assignee ? {
            full_name: data.assignee.profile?.full_name,
            avatar_url: data.assignee.profile?.profile_photo_url,
            staff_code: data.assignee.staff_profile?.staff_code
        } : null,
        comments
    };

    return task;
  },

  /**
   * Create a new task
   */
  async createTask(client: SupabaseClient, input: CreateTaskInput) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // --- Ensure Supervisor Profile Exists ---
    const { data: existingProfile } = await client
        .from("supervisor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!existingProfile) {
        // Auto-create a senior supervisor profile for the admin
        const { error: profileError } = await client.from("supervisor_profiles").insert({
            user_id: user.id,
            supervisor_level: 'senior',
            assigned_wards: [],
            assigned_departments: []
        });

        if (profileError && profileError.code !== '23505') {
             console.error("Failed to ensure supervisor profile:", profileError);
             // Attempt to proceed anyway, race condition might have resolved it
        }
    }

    // Generate tracking code
    const trackingCode = `TSK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Insert into Supervisor Tasks (The Record)
    const { data, error } = await client
      .from("supervisor_tasks")
      .insert({
        tracking_code: trackingCode,
        title: input.title,
        description: input.description,
        task_type: input.task_type,
        priority: input.priority,
        due_date: input.due_date.toISOString(),
        primary_assigned_to: input.primary_assigned_to,
        ward_id: input.ward_id || null,
        supervisor_id: user.id, 
        status: "not_started"
      })
      .select()
      .single();

    if (error) {
        console.error("Task Insert Failed:", error);
        throw error;
    }

    // 2. FIX: Insert into Staff Work Assignments (The Queue Item)
    // This is required for the task to appear in the staff's "My Tasks" list
    if (input.primary_assigned_to) {
        const { error: assignmentError } = await client
            .from("staff_work_assignments")
            .insert({
                staff_id: input.primary_assigned_to,
                task_id: data.id,
                assignment_status: "not_started",
                priority: input.priority as any, // Cast to match enum if needed
                due_at: input.due_date.toISOString(),
                assigned_by: user.id
            });

        if (assignmentError) {
            console.error("Failed to create work assignment:", assignmentError);
            // Non-blocking error, but should be logged. The task exists, but isn't in the queue.
        }
    }
    
    // 3. Create Notification
    await client.from("notifications").insert({
        user_id: input.primary_assigned_to,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${input.title}`,
        priority: input.priority === 'critical' ? 'high' : 'medium',
        entity_type: 'task',
        entity_id: data.id,
        action_url: `/staff/tasks/${data.id}`
    });

    return data;
  },

  /**
   * Update task details or status
   */
  async updateTask(client: SupabaseClient, id: string, updates: Partial<AdminTask>) {
    // If completing, set timestamp
    if (updates.status === 'completed') {
        (updates as any).completed_at = new Date().toISOString();
        (updates as any).completed_by = (await client.auth.getUser()).data.user?.id;
    }

    const { error } = await client
      .from("supervisor_tasks")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Reassign Task
   */
  async assignTask(client: SupabaseClient, taskId: string, staffId: string) {
    const { data: { user } } = await client.auth.getUser();
    
    // 1. Update Supervisor Task
    const { error } = await client
      .from("supervisor_tasks")
      .update({ primary_assigned_to: staffId })
      .eq("id", taskId);

    if (error) throw error;

    // 2. Update Work Assignment (Queue)
    // Delete old assignment if exists for this task to avoid duplicates/stale data
    await client.from("staff_work_assignments").delete().eq("task_id", taskId);

    // Create new assignment
    // Retrieve task details first to get due date/priority
    const { data: task } = await client.from("supervisor_tasks").select("priority, due_date").eq("id", taskId).single();
    
    if (task) {
        await client.from("staff_work_assignments").insert({
            staff_id: staffId,
            task_id: taskId,
            assignment_status: "not_started",
            priority: task.priority,
            due_at: task.due_date,
            assigned_by: user?.id
        });
    }

    // Log internal note
    try {
        await client.from("internal_notes").insert({
            task_id: taskId,
            supervisor_id: user?.id,
            content: `System: Reassigned task to new staff member.`,
            note_type: 'system',
            is_private: true
        });
    } catch (e) {
        console.warn("Could not log system note for reassignment", e);
    }
  },

  /**
   * Add a comment (Internal Note)
   */
  async addComment(client: SupabaseClient, taskId: string, content: string) {
      const { data: { user } } = await client.auth.getUser();
      const { error } = await client.from("internal_notes").insert({
          task_id: taskId,
          supervisor_id: user?.id,
          content,
          note_type: 'comment',
          is_private: false
      });
      if(error) throw error;
  },

  /**
   * Get count of overdue tasks
   */
  async getOverdueTasks(client: SupabaseClient) {
    const { count, error } = await client
      .from("supervisor_tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", new Date().toISOString())
      .neq("status", "completed");

    if (error) throw error;
    return count || 0;
  },

  /**
   * Delete Task
   */
  async deleteTask(client: SupabaseClient, id: string) {
    // Cascade delete should handle assignment, but good to be explicit or rely on DB constraints
    const { error } = await client
      .from("supervisor_tasks")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
  }
};