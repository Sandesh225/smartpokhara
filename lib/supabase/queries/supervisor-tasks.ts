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
      .from("supervisor_tasks")
      .select(
        `
        *,
        ward:wards(name)
      `
      )
      .eq("supervisor_id", supervisorId)
      .order("due_date", { ascending: true });

    // 2. Apply Filters
    if (filters) {
      if (filters.status?.length) query = query.in("status", filters.status);
      if (filters.priority?.length)
        query = query.in("priority", filters.priority);
      if (filters.task_type?.length)
        query = query.in("task_type", filters.task_type);
      if (filters.assigned_to)
        query = query.contains("assigned_to", [filters.assigned_to]);
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`
        );
      }
    }

    const { data: tasks, error } = await query;
    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }

    if (!tasks || tasks.length === 0) return [];

    // 3. Hydrate Staff Details (Safe Join)
    const staffIds = [
      ...new Set(tasks.map((t) => t.primary_assigned_to).filter(Boolean)),
    ];

    let staffMap: Record<string, { full_name: string; email?: string }> = {};

    if (staffIds.length > 0) {
      const [profiles, users] = await Promise.all([
        client
          .from("user_profiles")
          .select("user_id, full_name")
          .in("user_id", staffIds),
        client.from("users").select("id, email").in("id", staffIds),
      ]);

      profiles.data?.forEach((p) => {
        staffMap[p.user_id] = {
          ...staffMap[p.user_id],
          full_name: p.full_name,
        };
      });
      users.data?.forEach((u) => {
        staffMap[u.id] = { ...staffMap[u.id], email: u.email };
      });
    }

    // 4. Merge Data
    const enrichedTasks = tasks.map((task) => {
      const staffInfo = staffMap[task.primary_assigned_to];
      return {
        ...task,
        primary_assigned: staffInfo
          ? {
              user_id: task.primary_assigned_to,
              full_name: staffInfo.full_name,
              email: staffInfo.email,
            }
          : null,
      };
    });

    return enrichedTasks;
  },

  /**
   * Fetch a single task by ID.
   */
  async getTaskById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("supervisor_tasks")
      .select(
        `
      *,
      assignee:users!supervisor_tasks_primary_assigned_to_fkey(
        id, email,
        profile:user_profiles!user_profiles_user_id_fkey(full_name, profile_photo_url),
        staff_profile:staff_profiles!staff_profiles_user_id_fkey_public(staff_code)
      ),
      ward:wards(id, ward_number, name),
      checklist:task_checklist_items(*),
      comments:internal_notes(
          id, content, created_at, is_private,
          /* FIX: Ensure this matches the FK name created in SQL above */
          author:users!internal_notes_supervisor_id_fkey(
              profile:user_profiles!user_profiles_user_id_fkey(full_name, profile_photo_url)
          )
      )
    `
      )
      .eq("id", id)
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

      assignee = profile
        ? { name: profile.full_name, avatar: profile.avatar_url }
        : { name: "Unknown" };
    }

    return { ...task, assignee };
  },

  // Used by Workload Dashboard for reassigning
  async reassignTask(
    client: SupabaseClient,
    taskId: string,
    newStaffId: string
  ) {
    const { data, error } = await client
      .from("supervisor_tasks")
      .update({
        primary_assigned_to: newStaffId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async createTask(client: SupabaseClient, input: CreateTaskInput) {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. ENSURE SUPERVISOR PROFILE EXISTS
    const { data: existingProfile, error: checkError } = await client
      .from("supervisor_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existingProfile) {
      // Create profile and WAIT for completion
      const { error: profileError } = await client
        .from("supervisor_profiles")
        .insert({
          user_id: user.id,
          supervisor_level: "senior",
          assigned_wards: [],
          assigned_departments: [],
        });

      if (profileError) {
        console.error(
          "Critical: Could not create supervisor profile:",
          profileError
        );
        throw new Error(
          "Failed to initialize your supervisor profile. Please contact Admin."
        );
      }
    }

    // 2. GENERATE TRACKING CODE
    const trackingCode = `TSK-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // 3. INSERT TASK
    const { data, error: taskError } = await client
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
        supervisor_id: user.id, // Now guaranteed to exist in profiles
        status: "not_started",
      })
      .select()
      .single();

    if (taskError) {
      console.error("Task Insert Failed:", JSON.stringify(taskError, null, 2));
      throw taskError;
    }

    // 4. CREATE ASSIGNMENT QUEUE
    if (input.primary_assigned_to && data) {
      await client.from("staff_work_assignments").insert({
        staff_id: input.primary_assigned_to,
        task_id: data.id,
        assignment_status: "not_started",
        priority: input.priority as any,
        due_at: input.due_date.toISOString(),
        assigned_by: user.id,
      });
    }

    return data;
  },
  // Used for updating tasks
  async updateTask(client: SupabaseClient, taskId: string, updates: any) {
    const { data, error } = await client
      .from("supervisor_tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Used for deleting tasks
  async deleteTask(client: SupabaseClient, taskId: string) {
    const { error } = await client
      .from("supervisor_tasks")
      .delete()
      .eq("id", taskId);

    if (error) throw error;
  },

  // Used for toggling checklist items
  async toggleChecklistItem(
    client: SupabaseClient,
    itemId: string,
    isCompleted: boolean
  ) {
    const { error } = await client
      .from("task_checklist_items")
      .update({ is_completed: isCompleted })
      .eq("id", itemId);

    if (error) throw error;
  },
};