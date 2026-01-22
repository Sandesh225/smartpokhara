import type { SupabaseClient } from "@supabase/supabase-js";

export const staffQueueQueries = {
  async getMyAssignments(client: SupabaseClient, staffId: string) {
    const { data, error } = await client
      .from("staff_work_assignments")
      .select(
        `
        id, assignment_status, priority, due_at, completion_percentage, created_at,
        complaint:complaints(id, tracking_code, title, location_point, address_text, category:complaint_categories(name)),
        task:supervisor_tasks(id, tracking_code, title, location_point, address_text, task_type)
      `
      )
      .eq("staff_id", staffId)
      .not("assignment_status", "in", '("cancelled","rejected")')
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.complaint ? "complaint" : "task",
      reference_id: item.complaint?.id || item.task?.id,
      tracking_code: item.complaint?.tracking_code || item.task?.tracking_code,
      title: item.complaint?.title || item.task?.title || "Untitled Assignment",
      category:
        item.complaint?.category?.name ||
        item.task?.task_type?.replace(/_/g, " ") ||
        "General",
      location:
        item.complaint?.address_text ||
        item.task?.address_text ||
        "No location provided",
      coordinates: item.complaint?.location_point || item.task?.location_point,
      status: item.assignment_status,
      priority: item.priority,
      due_at: item.due_at,
      assigned_at: item.created_at,
      completion: item.completion_percentage,
    }));
  },

  async getTeamAssignments(client: SupabaseClient, staffId: string) {
    const { data: profile } = await client
      .from("staff_profiles")
      .select("ward_id, department_id")
      .eq("user_id", staffId)
      .single();

    if (!profile) return [];

    let query = client
      .from("staff_work_assignments")
      .select(
        `
        id, assignment_status, priority, due_at, completion_percentage, created_at,
        staff:staff_profiles!inner(user_id, user:users(profile:user_profiles(full_name, avatar_url))),
        complaint:complaints(id, tracking_code, title, location_point, address_text, category:complaint_categories(name)),
        task:supervisor_tasks(id, tracking_code, title, location_point, address_text, task_type)
      `
      )
      .neq("staff_id", staffId)
      .not("assignment_status", "in", '("cancelled","rejected")')
      .limit(50);

    if (profile.ward_id) {
      query = query.eq("staff.ward_id", profile.ward_id);
    } else if (profile.department_id) {
      query = query.eq("staff.department_id", profile.department_id);
    } else {
      return [];
    }

    const { data, error } = await query;
    if (error) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.complaint ? "complaint" : "task",
      reference_id: item.complaint?.id || item.task?.id,
      title: item.complaint?.title || item.task?.title,
      status: item.assignment_status,
      priority: item.priority,
      assignee: {
        name: item.staff?.user?.profile?.full_name || "Unknown",
        avatar: item.staff?.user?.profile?.avatar_url,
      },
    }));
  },

  async getAssignmentById(client: SupabaseClient, assignmentId: string) {
    const { data, error } = await client
      .from("staff_work_assignments")
      .select(
        `
      *,
      complaint:complaints(
        id, tracking_code, title, description, status, priority, 
        address_text, location_point, ward:wards(ward_number, name),
        citizen:users!complaints_citizen_id_fkey(phone, email, profile:user_profiles(full_name)),
        attachments:complaint_attachments(id, file_path, file_name, file_type, created_at)
      ),
      task:supervisor_tasks(
        id, tracking_code, title, description, status, priority,
        address_text, location_point, task_type
      ),
      assigned_by_user:users!staff_work_assignments_assigned_by_fkey(
        profile:user_profiles(full_name)
      )
    `
      )
      .eq("id", assignmentId)
      .maybeSingle();

    if (error) {
      console.error("Database Fetch Error:", error.message);
      return null;
    }

    if (!data) return null;

    const base = data.complaint || data.task;
    if (!base) return null;

    return {
      id: data.id,
      staff_id: data.staff_id,
      type: data.complaint ? "complaint" : "task",
      title: base.title,
      description: base.description,
      tracking_code: base.tracking_code,
      status: data.assignment_status,
      priority: data.priority,
      due_at: data.due_at,
      location: base.address_text,
      coordinates: base.location_point,
      ward: data.complaint ? `Ward ${base.ward?.ward_number}` : "N/A",
      assigned_at: data.assigned_at,
      started_at: data.started_at,
      completed_at: data.completed_at,
      citizen: data.complaint
        ? {
            name: base.citizen?.profile?.full_name || "Unknown",
            phone: base.citizen?.phone,
            email: base.citizen?.email,
          }
        : null,
      assigned_by_name:
        data.assigned_by_user?.profile?.full_name || "Supervisor",
      instructions: data.assignment_notes,
      attachments: data.complaint?.attachments || [],
    };
  },

  async startAssignment(
    client: SupabaseClient,
    assignmentId: string,
    location?: { lat: number; lng: number }
  ) {
    const locationJson = location
      ? { type: "Point", coordinates: [location.lng, location.lat] }
      : null;

    const { data, error } = await client.rpc("rpc_start_assignment", {
      p_assignment_id: assignmentId,
      p_checkin_location: locationJson,
    });

    if (error) {
      console.error("RPC Error in startAssignment:", error);
      throw error;
    }

    return data;
  },

  async uploadWorkPhoto(client: SupabaseClient, staffId: string, file: File) {
    const fileExt = file.name.split(".").pop();
    const path = `${staffId}/${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const { error: uploadError } = await client.storage
      .from("staff-work-photos")
      .upload(path, file);

    if (uploadError) throw uploadError;

    const { data } = client.storage
      .from("staff-work-photos")
      .getPublicUrl(path);
    return data.publicUrl;
  },

  async completeAssignment(
    client: SupabaseClient,
    assignmentId: string,
    notes: string,
    photos: string[] = []
  ) {
    const { data, error } = await client.rpc("rpc_complete_assignment", {
      p_assignment_id: assignmentId,
      p_resolution_notes: notes,
      p_photos: photos,
      p_materials_used: [],
    });

    if (error) {
      console.error("RPC Error:", error.message, error.details, error.hint);
      throw new Error(error.message || "Unknown database error occurred");
    }

    return data;
  },
};