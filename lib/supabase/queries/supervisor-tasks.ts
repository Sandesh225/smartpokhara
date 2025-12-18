import type { SupabaseClient } from "@supabase/supabase-js";

export const supervisorTasksQueries = {
  /**
   * Fetch tasks for the list view.
   * FIX: Replaced nested join with manual hydration to prevent database relationship errors.
   */
  async getSupervisorTasks(
    client: SupabaseClient, 
    supervisorId: string,
    filters?: {
      status?: string[];
      priority?: string[];
      task_type?: string[];
      assigned_to?: string;
      search?: string;
    }
  ) {
    // 1. Fetch Tasks (Base Data)
    let query = client
      .from('supervisor_tasks')
      .select(`
        *,
        ward:wards(name)
      `)
      .eq('supervisor_id', supervisorId)
      .order('due_date', { ascending: true });

    // 2. Apply Filters
    if (filters) {
      if (filters.status?.length) query = query.in('status', filters.status);
      if (filters.priority?.length) query = query.in('priority', filters.priority);
      if (filters.task_type?.length) query = query.in('task_type', filters.task_type);
      if (filters.assigned_to) query = query.contains('assigned_to', [filters.assigned_to]);
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`);
      }
    }

    const { data: tasks, error } = await query;
    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
    
    if (!tasks || tasks.length === 0) return [];

    // 3. Hydrate Staff Details (Safe Join)
    const staffIds = [...new Set(tasks.map((t) => t.primary_assigned_to).filter(Boolean))];
    
    let staffMap: Record<string, { full_name: string; email?: string }> = {};

    if (staffIds.length > 0) {
      const [profiles, users] = await Promise.all([
        client.from("user_profiles").select("user_id, full_name").in("user_id", staffIds),
        client.from("users").select("id, email").in("id", staffIds)
      ]);

      profiles.data?.forEach(p => {
        staffMap[p.user_id] = { ...staffMap[p.user_id], full_name: p.full_name };
      });
      users.data?.forEach(u => {
        staffMap[u.id] = { ...staffMap[u.id], email: u.email };
      });
    }

    // 4. Merge Data
    const enrichedTasks = tasks.map(task => {
      const staffInfo = staffMap[task.primary_assigned_to];
      return {
        ...task,
        primary_assigned: staffInfo ? {
          user_id: task.primary_assigned_to,
          full_name: staffInfo.full_name,
          email: staffInfo.email
        } : null
      };
    });

    return enrichedTasks;
  },

  /**
   * Fetch a single task by ID.
   */
  async getTaskById(client: SupabaseClient, taskId: string) {
    const { data: task, error } = await client
      .from("supervisor_tasks")
      .select(`
        *,
        ward:wards(name, ward_number),
        checklist_items:task_checklist_items(*)
      `)
      .eq("id", taskId)
      .single();

    if (error || !task) return null;

    // Hydrate Assignee
    let assignee = null;
    if (task.primary_assigned_to) {
      const { data: profile } = await client
        .from("user_profiles")
        .select("full_name, avatar_url")
        .eq("user_id", task.primary_assigned_to)
        .single();
      
      assignee = profile ? { name: profile.full_name, avatar: profile.avatar_url } : { name: "Unknown" };
    }

    return { ...task, assignee };
  },

  // Used by Workload Dashboard for reassigning
  async reassignTask(client: SupabaseClient, taskId: string, newStaffId: string) {
    const { data, error } = await client
      .from("supervisor_tasks")
      .update({
        primary_assigned_to: newStaffId,
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Used for creating tasks
  async createTask(client: SupabaseClient, taskData: any, checklistItems: string[] = []) {
    // 1. Create Task
    const { data: task, error: taskError } = await client
      .from('supervisor_tasks')
      .insert(taskData)
      .select()
      .single();
      
    if (taskError) {
      console.error("Create Task DB Error:", JSON.stringify(taskError, null, 2));
      throw taskError;
    }

    // 2. Create Checklist
    if (checklistItems.length > 0 && task) {
      const items = checklistItems.map((desc, i) => ({
        task_id: task.id,
        description: desc,
        display_order: i,
        is_required: true,   // Ensure defaults
        is_completed: false  // Ensure defaults
      }));
      
      const { error: checklistError } = await client.from('task_checklist_items').insert(items);
      
      if (checklistError) {
        console.error("Create Checklist DB Error:", JSON.stringify(checklistError, null, 2));
        // We warn but don't fail the whole operation since the main task exists
        // Alternatively, throw here to trigger rollback logic if you had it
      }
    }

    return task;
  },

  // Used for updating tasks
  async updateTask(client: SupabaseClient, taskId: string, updates: any) {
    const { data, error } = await client
      .from('supervisor_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Used for deleting tasks
  async deleteTask(client: SupabaseClient, taskId: string) {
    const { error } = await client
      .from('supervisor_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  // Used for toggling checklist items
  async toggleChecklistItem(client: SupabaseClient, itemId: string, isCompleted: boolean) {
    const { error } = await client
      .from('task_checklist_items')
      .update({ is_completed: isCompleted })
      .eq('id', itemId);

    if (error) throw error;
  }
};