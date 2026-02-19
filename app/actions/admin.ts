"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ComplaintFilters, ComplaintStatus, ComplaintPriority } from "@/features/complaints/types";
import { TaskStatus, TaskPriority, TaskType, TaskScope } from "@/features/tasks/types";

// ==========================================
// COMPLAINTS
// ==========================================

export async function getAdminComplaints(params: ComplaintFilters & { page?: number; page_size?: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // TODO: Add stricter role check here if needed (e.g. check supervisor_profiles)
  // For now, RLS blocks direct access, so this action acts as the gatekeeper.

  const adminClient = createAdminClient();
  
  const { 
    page = 1, 
    page_size = 10, 
    search: search_term, 
    status, 
    priority, 
    category_id, 
    ward_id
  } = params;

  let query = adminClient
    .from("complaints")
    .select(`
      *,
      ward:wards!ward_id(id, name, ward_number),
      category:complaint_categories!category_id(id, name),
      citizen:users!complaints_citizen_id_fkey(
        id, email, phone,
        profile:user_profiles(full_name, profile_photo_url)
      ),
      assigned_staff:users!complaints_assigned_staff_id_fkey(
         id, email,
         profile:user_profiles(full_name)
      )
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * page_size, page * page_size - 1);

   if (status && (status as string[]).length > 0) query = query.in("status", status as any[]);
   if (priority && (priority as string[]).length > 0) query = query.in("priority", priority as any[]);
   if (category_id) query = query.eq("category_id", category_id);
   if (ward_id) query = query.eq("ward_id", ward_id);
   if (search_term) query = query.or(`title.ilike.%${search_term}%,tracking_code.ilike.%${search_term}%`);

   const { data, count, error } = await query;
   
   if (error) throw error;
   return { data: data || [], count: count || 0 };
}

// ==========================================
// NOTICES
// ==========================================

export async function getAdminNotices(params: { publishedOnly?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const adminClient = createAdminClient();

  let query = adminClient.from("notices").select("*", { count: "exact" });
  
  if (params.publishedOnly) {
     const now = new Date().toISOString();
     query = query.lte("published_at", now).or(`expires_at.is.null,expires_at.gt.${now}`);
  }

  const { data, count, error } = await query
      .order("created_at", { ascending: false });

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

// ==========================================
// TASKS
// ==========================================

export async function getAdminTasks(filters: {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  task_type?: TaskType[];
  search?: string;
  scope?: TaskScope;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const adminClient = createAdminClient();

  let query = adminClient.from("supervisor_tasks").select(`
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

   if (filters.status?.length) query = query.in("status", filters.status as any[]);
   if (filters.priority?.length) query = query.in("priority", filters.priority as any[]);
   if (filters.task_type?.length) query = query.in("task_type", filters.task_type as any[]);
   if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`);
   }

   const { data, count, error } = await query.order("due_date", { ascending: true });

   if (error) throw error;

   return { 
      data: (data || []).map(t => ({
        ...t,
        assignee_name: t.assignee?.profile?.full_name || "Unassigned",
        assignee_avatar: t.assignee?.profile?.profile_photo_url,
        staff_code: t.assignee?.staff_profile?.[0]?.staff_code,
        supervisor_name: t.supervisor?.profile?.full_name || "Admin",
        ward_name: t.ward?.name
      })), 
      count: count || 0 
    };
}
