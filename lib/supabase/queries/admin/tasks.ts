import { SupabaseClient } from "@supabase/supabase-js";
import { AdminTask, CreateTaskInput, TaskFiltersState, TaskComment } from "@/types/admin-tasks";

/**
 * Utility to handle nested Supabase objects
 */
const unwrap = (val: any) => (Array.isArray(val) ? val[0] : val);

export const adminTaskQueries = {
 async getAllTasks(
    client: SupabaseClient,
    filters: TaskFiltersState,
    page = 1,
    pageSize = 20
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // FIX: Using the explicit constraint names defined in SQL Step 1
    let query = client.from("supervisor_tasks").select(
      `
        *,
        assignee:users!supervisor_tasks_primary_assigned_to_fkey(
          email,
          profile:user_profiles(full_name, profile_photo_url),
          staff_profile:staff_profiles(staff_code)
        ),
        ward:wards(ward_number, name),
        supervisor:users!supervisor_tasks_supervisor_id_fkey(
          profile:user_profiles(full_name)
        )
      `,
      { count: "exact" }
    );

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.status?.length > 0) query = query.in("status", filters.status);
    if (filters.priority?.length > 0) query = query.in("priority", filters.priority);
    
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Admin Tasks Fetch Error:", error);
      // Fallback for empty error objects
      throw new Error(error.message || "Unknown database error while fetching tasks");
    }

    const tasks: AdminTask[] = (data || []).map((t: any) => {
      const assigneeUser = unwrap(t.assignee);
      const assigneeProfile = unwrap(assigneeUser?.profile);
      const supervisorUser = unwrap(t.supervisor);

      return {
        ...t,
        assignee: assigneeUser ? {
          full_name: assigneeProfile?.full_name || "Unknown",
          avatar_url: assigneeProfile?.profile_photo_url,
          staff_code: unwrap(assigneeUser.staff_profile)?.staff_code
        } : null,
        supervisor: {
          full_name: unwrap(supervisorUser?.profile)?.full_name || "Admin"
        }
      };
    });

    return { data: tasks, count: count || 0 };
  },

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
        comments:internal_notes(
            id, content, created_at, is_private,
            author:users!internal_notes_supervisor_id_fkey(
                profile:user_profiles(full_name, profile_photo_url)
            )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    const comments: TaskComment[] = (data.comments || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      is_private: c.is_private,
      author: {
        full_name: unwrap(c.author?.profile)?.full_name || "Unknown",
        avatar_url: unwrap(c.author?.profile)?.profile_photo_url,
      },
    }));

    const assignee = unwrap(data.assignee);
    const profile = unwrap(assignee?.profile);
    const staff = unwrap(assignee?.staff_profile);

    return {
      ...data,
      assignee: assignee ? {
        full_name: profile?.full_name,
        avatar_url: profile?.profile_photo_url,
        staff_code: staff?.staff_code,
      } : null,
      comments,
    };
  },
async createTask(client: SupabaseClient, input: CreateTaskInput) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // We MUST ensure the supervisor_id matches the authenticated user
  const { data, error } = await client
    .from("supervisor_tasks")
    .insert({
      tracking_code: `TSK-${Date.now()}`,
      title: input.title,
      description: input.description,
      task_type: input.task_type,
      priority: input.priority,
      due_date: input.due_date.toISOString(),
      primary_assigned_to: input.primary_assigned_to,
      ward_id: input.ward_id || null,
      supervisor_id: user.id, // This must match auth.uid() for RLS to pass
      status: "not_started",
    })
    .select()
    .single();

  if (error) {
    console.error("RLS or Database Error:", error);
    throw new Error(error.message);
  }
  return data;
},

  async updateTask(client: SupabaseClient, id: string, updates: Partial<AdminTask>) {
    const { error } = await client
      .from("supervisor_tasks")
      .update(updates)
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async deleteTask(client: SupabaseClient, id: string) {
    const { error } = await client.from("supervisor_tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async getOverdueTasks(client: SupabaseClient) {
    const { count, error } = await client
      .from("supervisor_tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", new Date().toISOString())
      .neq("status", "completed");

    if (error) return 0;
    return count || 0;
  }
};