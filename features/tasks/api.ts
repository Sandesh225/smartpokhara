import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { ProjectTask, TaskFilters, UnifiedAssignment, TaskStatistics } from "./types";

export const tasksApi = {
  async getTasks(client: SupabaseClient<Database>, params: TaskFilters) {
    const { 
      page = 1, 
      pageSize = 20, 
      status, 
      priority, 
      task_type, 
      search, 
      scope = "all", 
      userId, 
      wardId 
    } = params;
    
    let query = (client as any).from("supervisor_tasks").select(`
      *,
      ward:wards(id, ward_number, name),
      assignee:users!supervisor_tasks_primary_assigned_to_fkey(
        id, email,
        profile:user_profiles(full_name, profile_photo_url),
        staff_profile:staff_profiles(staff_code)
      ),
      supervisor:users!supervisor_tasks_supervisor_id_fkey(
        profile:user_profiles(full_name)
      )
    `, { count: "exact" });

    if (scope === "assigned_to_me" && userId) {
      query = query.eq("primary_assigned_to", userId);
    } else if (scope === "supervisor_view" && userId) {
      query = query.eq("supervisor_id", userId);
    } else if (scope === "ward_view" && wardId) {
      query = query.eq("ward_id", wardId);
    } else if (scope === "overdue") {
      query = query.lt("due_date", new Date().toISOString()).neq("status", "completed");
    }

    if (status?.length) query = query.in("status", status);
    if (priority?.length) query = query.in("priority", priority);
    if (task_type?.length) query = query.in("task_type", task_type);
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tracking_code.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("due_date", { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return { 
      data: (data || []).map((t: any) => {
        const assignee = t.assignee;
        const supervisor = t.supervisor;
        const ward = t.ward;
        
        return {
          ...t,
          assignee_name: assignee?.profile?.full_name || "Unassigned",
          assignee_avatar: assignee?.profile?.profile_photo_url,
          staff_code: assignee?.staff_profile?.staff_code,
          supervisor_name: supervisor?.profile?.full_name || "Admin",
          ward_name: ward?.name,
          assignee: assignee ? {
            full_name: assignee.profile?.full_name || "Unknown",
            avatar_url: assignee.profile?.profile_photo_url,
            staff_code: assignee.staff_profile?.staff_code
          } : null,
          supervisor: {
            full_name: supervisor?.profile?.full_name || "Admin"
          },
          ward: ward ? {
            ward_number: ward.ward_number,
            name: ward.name
          } : null
        };
      }) as ProjectTask[], 
      count: count || 0 
    };
  },

  async getTaskById(client: SupabaseClient<Database>, id: string) {
    const { data, error } = await (client as any)
      .from("supervisor_tasks")
      .select(`
        *,
        ward:wards(id, ward_number, name),
        related_complaint:complaints(tracking_code, title, description, location_point, address_text),
        assigned_department:departments(name),
        assignee:users!supervisor_tasks_primary_assigned_to_fkey(
          id, email, phone,
          profile:user_profiles(full_name, profile_photo_url),
          staff_profile:staff_profiles(staff_code)
        ),
        supervisor:users!supervisor_tasks_supervisor_id_fkey(
           profile:user_profiles(full_name)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    const { data: comments } = await (client as any).from("internal_notes").select(`
      *, 
      author:users!internal_notes_supervisor_id_fkey(
        profile:user_profiles(full_name, profile_photo_url)
      )
    `).eq("task_id", id).order("created_at");

    return {
      ...data,
      assignee_name: (data as any).assignee?.profile?.full_name || "Unassigned",
      assignee_avatar: (data as any).assignee?.profile?.profile_photo_url,
      assignee_phone: (data as any).assignee?.phone,
      checklist_items: [],
      comments: (comments || []).map((c: any) => ({
        ...c,
        author_name: c.author?.profile?.full_name || "Unknown",
        author_avatar: c.author?.profile?.profile_photo_url
      }))
    } as any as ProjectTask;
  },

  async createTask(client: SupabaseClient<Database>, input: Partial<ProjectTask>, checklist_items?: string[]) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const trackingCode = input.tracking_code || `TSK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await (client as any).from("supervisor_tasks").insert({
      ...input,
      tracking_code: trackingCode,
      supervisor_id: user.id,
      status: input.status || "not_started"
    } as any).select().single();

    if (error) throw error;

    if (checklist_items && checklist_items.length > 0) {
        const items = checklist_items.map(desc => ({
            task_id: (data as any).id,
            description: desc,
            is_completed: false
        }));
        await (client as any).from("task_checklist_items").insert(items);
    }

    return data as any as ProjectTask;
  },

  async toggleChecklistItem(client: SupabaseClient<Database>, itemId: string, isCompleted: boolean) {
      const { error } = await (client as any)
        .from("task_checklist_items")
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq("id", itemId);
      if (error) throw error;
  },

  async updateTask(client: SupabaseClient<Database>, id: string, updates: Partial<ProjectTask>) {
    const { error } = await (client as any).from("supervisor_tasks").update(updates as any).eq("id", id);
    if (error) throw error;
  },

  async deleteTask(client: SupabaseClient<Database>, id: string) {
    const { error } = await (client as any).from("supervisor_tasks").delete().eq("id", id);
    if (error) throw error;
  },

  async getStaffAssignments(client: SupabaseClient<Database>, userId: string) {
    const { data: tasks } = await (client as any)
      .from("supervisor_tasks")
      .select(`
        id, tracking_code, title, description, status, priority, due_date, 
        ward:wards(name)
      `)
      .eq("primary_assigned_to", userId)
      .neq("status", "completed");

    const { data: complaints } = await (client as any)
      .from("complaints")
      .select(`
        id, tracking_code, title, description, status, priority, sla_due_at,
        ward:wards(name),
        address_text
      `)
      .eq("assigned_staff_id", userId)
      .neq("status", "resolved")
      .neq("status", "closed");

    const normalizedTasks: UnifiedAssignment[] = (tasks || []).map((t: any) => ({
      id: t.id,
      type: "task",
      tracking_code: t.tracking_code,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      due_at: t.due_date,
      ward_name: t.ward?.name,
      location: "Internal"
    }));

    const normalizedComplaints: UnifiedAssignment[] = (complaints || []).map((c: any) => ({
      id: c.id, 
      type: "complaint",
      tracking_code: c.tracking_code,
      title: c.title,
      description: c.description,
      status: c.status, 
      priority: c.priority,
      due_at: c.sla_due_at,
      ward_name: c.ward?.name,
      location: c.address_text || "Field"
    }));

    return [...normalizedTasks, ...normalizedComplaints].sort((a,b) => 
      new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime()
    );
  },

  async getOverdueTasksCount(client: SupabaseClient<Database>) {
    const { count, error } = await (client as any)
      .from("supervisor_tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", new Date().toISOString())
      .neq("status", "completed");

    if (error) throw error;
    return count || 0;
  },

  async addComment(client: SupabaseClient<Database>, taskId: string, content: string, isPrivate = false) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await (client as any)
      .from("internal_notes")
      .insert({
        task_id: taskId,
        content: content,
        supervisor_id: user.id,
        is_private: isPrivate
      });

    if (error) throw error;
  },

  async assignTask(client: SupabaseClient<Database>, taskId: string, staffId: string) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: task } = await (client as any)
      .from("supervisor_tasks")
      .select("priority, due_date")
      .eq("id", taskId)
      .single();

    if (!task) throw new Error("Task not found");

    const { error: taskError } = await (client as any)
      .from("supervisor_tasks")
      .update({ primary_assigned_to: staffId })
      .eq("id", taskId);

    if (taskError) throw taskError;

    const { error: assignError } = await (client as any)
      .from("staff_work_assignments")
      .insert({
        staff_id: staffId,
        task_id: taskId,
        assignment_status: "not_started",
        priority: (task as any).priority,
        due_at: (task as any).due_date,
        assigned_by: user.id
      });

    if (assignError) throw assignError;
  },

  async getTaskStatistics(client: SupabaseClient<Database>): Promise<TaskStatistics> {
    const { data, error } = await (client as any).from("supervisor_tasks").select("status, priority, due_date");
    if (error) throw error;

    const stats: TaskStatistics = {
      total: (data || []).length,
      not_started: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
      by_priority: { low: 0, medium: 0, high: 0, critical: 0 }
    };

    const now = new Date();
    (data || []).forEach((t: any) => {
      if (t.status === "not_started") stats.not_started++;
      else if (t.status === "in_progress") stats.in_progress++;
      else if (t.status === "completed") stats.completed++;

      if (t.due_date && new Date(t.due_date) < now && t.status !== "completed") {
        stats.overdue++;
      }

      if (t.priority in stats.by_priority) {
        (stats.by_priority as any)[t.priority]++;
      }
    });

    return stats;
  },

  async getTeamAssignments(client: SupabaseClient<Database>, userId: string) {
    const { data: profile } = await (client as any).from("staff_profiles").select("ward_id").eq("user_id", userId).single();
    if (!profile?.ward_id) return [];

    const { data: tasks } = await (client as any)
      .from("supervisor_tasks")
      .select(`
        id, tracking_code, title, status, priority, due_date,
        assignee:users!supervisor_tasks_primary_assigned_to_fkey(
          profile:user_profiles(full_name, profile_photo_url)
        )
      `)
      .eq("ward_id", profile.ward_id);

    return (tasks || []).map((t: any) => ({
      ...t,
      type: "task",
      due_at: t.due_date,
      assignee: { 
        name: t.assignee?.profile?.full_name, 
        avatar: t.assignee?.profile?.profile_photo_url 
      }
    })) as UnifiedAssignment[];
  },

  async startAssignment(client: SupabaseClient<Database>, id: string) {
    const { error } = await (client as any)
      .from("supervisor_tasks")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async uploadWorkPhoto(client: SupabaseClient<Database>, staffId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${staffId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await (client as any).storage.from("work-photos").upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = (client as any).storage.from("work-photos").getPublicUrl(fileName);
    return (urlData as any).publicUrl;
  },

  async completeAssignment(client: SupabaseClient<Database>, id: string, _notes: string) {
    const { error } = await (client as any)
      .from("supervisor_tasks")
      .update({
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    if (error) throw error;
  }
};
