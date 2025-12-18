import type { SupabaseClient } from "@supabase/supabase-js";
import type { ComplaintFilters } from "@/lib/types/supervisor.types";

export const supervisorComplaintsQueries = {
  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  /**
   * Fetch a single complaint by ID with ALL relationships.
   * FIX: Correctly traverses complaints -> users -> staff_profiles to avoid PGRST200
   * FIX: Uses 'profile_photo_url' instead of 'avatar_url' for DB queries
   */
  async getComplaintById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("complaints")
      .select(`
        *,
        ward:wards(name, ward_number),
        category:complaint_categories(name, default_department_id),
        department:departments(name),
        citizen:users!complaints_citizen_id_fkey(
           id, email, phone,
           profile:user_profiles(full_name, profile_photo_url)
        ),
        assigned_user:users!complaints_assigned_staff_id_fkey(
           id, email, phone,
           profile:user_profiles(full_name, profile_photo_url),
           staff_profile:staff_profiles(staff_code, staff_role)
        ),
        attachments:complaint_attachments(*),
        comments:complaint_comments(
           id, content, created_at, is_internal, author_role,
           author:users(profile:user_profiles(full_name, profile_photo_url))
        ),
        history:complaint_status_history(
           id, old_status, new_status, created_at, note, changed_by_role,
           actor:users(profile:user_profiles(full_name))
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching complaint:", error);
      return { data: null, error };
    }

    // 1. Normalize Staff Data
    // Supabase might return arrays for 1:1 relations depending on schema definition details
    const rawStaffUser = Array.isArray(data.assigned_user) ? data.assigned_user[0] : data.assigned_user;
    const rawStaffProfile = rawStaffUser?.staff_profile 
        ? (Array.isArray(rawStaffUser.staff_profile) ? rawStaffUser.staff_profile[0] : rawStaffUser.staff_profile) 
        : null;

    const assigned_staff = rawStaffUser ? {
        user_id: rawStaffUser.id,
        full_name: rawStaffUser.profile?.full_name || 'Unknown Staff',
        avatar_url: rawStaffUser.profile?.profile_photo_url, // Map DB column to UI prop
        email: rawStaffUser.email,
        phone: rawStaffUser.phone,
        staff_code: rawStaffProfile?.staff_code,
        role: rawStaffProfile?.staff_role
    } : null;

    // 2. Normalize Comments
    const updates = (data.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        author_role: c.author_role,
        is_internal: c.is_internal,
        author_name: c.author?.profile?.full_name || 'Unknown',
        author_avatar: c.author?.profile?.profile_photo_url // Map DB column to UI prop
    }));

    // 3. Normalize Citizen Data
    const rawCitizen = Array.isArray(data.citizen) ? data.citizen[0] : data.citizen;
    
    const citizen = rawCitizen ? {
        id: rawCitizen.id,
        email: rawCitizen.email,
        phone: rawCitizen.phone,
        full_name: rawCitizen.profile?.full_name || 'Unknown Citizen',
        avatar_url: rawCitizen.profile?.profile_photo_url // Map DB column to UI prop
    } : null;

    return { 
        data: { 
          ...data, 
          assigned_staff, 
          updates, 
          citizen 
        }, 
        error: null 
    };
  },

  /**
   * Fetches complaints based on jurisdiction and applied filters.
   */
  async getJurisdictionComplaints(
    client: SupabaseClient,
    supervisorId: string, 
    filters?: ComplaintFilters,
    page = 1,
    pageSize = 50
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 1. Fetch Supervisor's Scope
    const { data: profile } = await client
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", supervisorId)
      .single();

    const assignedWards = profile?.assigned_wards || [];
    const assignedDepts = profile?.assigned_departments || [];
    const isSenior = profile?.supervisor_level === 'senior';

    let query = client
      .from("complaints")
      .select(
        `
        id, tracking_code, title, description, status, priority,
        category_id, ward_id, submitted_at, sla_due_at, updated_at,
        assigned_staff_id, citizen_id,
        category:complaint_categories(name),
        ward:wards(name, ward_number),
        citizen_data:users!complaints_citizen_id_fkey(
           email, phone,
           profile:user_profiles(full_name, profile_photo_url)
        ),
        assigned_user:users!complaints_assigned_staff_id_fkey(
           email,
           profile:user_profiles(full_name, profile_photo_url),
           staff_profile:staff_profiles(staff_code, staff_role)
        )
      `,
        { count: "exact" }
      )
      .order("submitted_at", { ascending: false })
      .range(from, to);

    // 2. Apply Jurisdiction Filters
    if (!isSenior && (assignedWards.length > 0 || assignedDepts.length > 0)) {
        const conditions = [];
        if (assignedWards.length > 0) conditions.push(`ward_id.in.(${assignedWards.join(',')})`);
        if (assignedDepts.length > 0) conditions.push(`assigned_department_id.in.(${assignedDepts.join(',')})`);
        
        if (conditions.length > 0) {
            query = query.or(conditions.join(','));
        }
    }

    // 3. Apply UI Filters
    if (filters) {
      if (filters.status?.length) query = query.in("status", filters.status);
      if (filters.priority?.length) query = query.in("priority", filters.priority);
      if (filters.ward_id?.length) query = query.in("ward_id", filters.ward_id);
      if (filters.category?.length) query = query.in("category_id", filters.category);
      if (filters.assigned_to) query = query.eq("assigned_staff_id", filters.assigned_to);
      
      if (filters.date_from) query = query.gte("submitted_at", filters.date_from);
      if (filters.date_to) query = query.lte("submitted_at", filters.date_to);

      if ((filters as any).search) {
        const search = (filters as any).search;
        query = query.or(`tracking_code.ilike.%${search}%,title.ilike.%${search}%`);
      }
    }

    const { data: rawData, error, count } = await query;

    if (error) {
        console.error("List Fetch Error:", JSON.stringify(error, null, 2));
        throw error;
    }

    // 4. Flatten Data for UI
    const flattenedData = (rawData || []).map((item: any) => {
      const staffUser = Array.isArray(item.assigned_user) ? item.assigned_user[0] : item.assigned_user;
      const staffProfile = Array.isArray(staffUser?.staff_profile) ? staffUser.staff_profile[0] : staffUser?.staff_profile;
      
      const citizenUser = Array.isArray(item.citizen_data) ? item.citizen_data[0] : item.citizen_data;

      return {
        ...item,
        citizen: {
          email: citizenUser?.email,
          phone: citizenUser?.phone,
          full_name: citizenUser?.profile?.full_name || "Unknown Citizen",
          avatar_url: citizenUser?.profile?.profile_photo_url
        },
        assigned_staff: staffUser
          ? {
              full_name: staffUser.profile?.full_name || "Staff",
              staff_code: staffProfile?.staff_code || "N/A",
              email: staffUser.email,
              avatar_url: staffUser.profile?.profile_photo_url
            }
          : null,
      };
    });

    return { data: flattenedData, count: count || 0 };
  },

  async getUnassignedComplaints(client: SupabaseClient) {
    const { data, error } = await client
      .from("complaints")
      .select(`
        id, tracking_code, title, status, priority, submitted_at,
        ward:wards(name), category:complaint_categories(name)
      `)
      .is("assigned_staff_id", null)
      .neq("status", "closed")
      .order("priority", { ascending: false })
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  // ============================================================================
  // SUB-RESOURCES
  // ============================================================================

  async getComplaintTimeline(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("complaint_updates") 
      .select(`
        id, update_type, old_status, new_status, reason, note, created_at,
        actor:users!complaint_updates_created_by_fkey(
          profile:user_profiles(full_name, profile_photo_url)
        )
      `)
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: false });

    if (error) return []; // Return empty if table doesn't exist yet
    return data || [];
  },

  async getComplaintAttachments(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("complaint_attachments")
      .select("*")
      .eq("complaint_id", complaintId);

    if (error) throw error;

    return {
      citizenUploads: data?.filter(a => a.uploaded_by_role === 'citizen') || [],
      staffUploads: data?.filter(a => ['staff', 'supervisor', 'admin'].includes(a.uploaded_by_role)) || []
    };
  },

  async getInternalNotes(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("internal_notes")
      .select(`
        id, text, tags, visibility, created_at,
        author:users!internal_notes_author_id_fkey(
          profile:user_profiles(full_name, profile_photo_url)
        )
      `)
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getComplaintWorkLogs(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("staff_work_logs")
      .select(`
        id, log_type, description, photo_urls, created_at,
        staff_id
      `)
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: false });

    if (error) {
       console.warn("Work logs fetch failed", error); 
       return [];
    }
    return data || [];
  },

  async getRelatedComplaints(client: SupabaseClient, complaintId: string) {
    const { data: current } = await client
        .from("complaints")
        .select("category_id, ward_id")
        .eq("id", complaintId)
        .single();
    
    if (!current) return [];

    const { data, error } = await client
      .from("complaints")
      .select("id, tracking_code, title, status, created_at")
      .neq("id", complaintId)
      .or(`category_id.eq.${current.category_id},ward_id.eq.${current.ward_id}`)
      .limit(5);

    if (error) throw error;
    return data || [];
  },

  // ============================================================================
  // WRITE OPERATIONS
  // ============================================================================

  async assignComplaint(client: SupabaseClient, complaintId: string, staffId: string, notes?: string) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    const now = new Date().toISOString();

    // 1. Update Complaint
    const { data, error } = await client
      .from("complaints")
      .update({
        assigned_staff_id: staffId,
        assigned_at: now,
        status: "assigned",
        updated_at: now,
      })
      .eq("id", complaintId)
      .select()
      .single();

    if (error) throw error;

    // 2. Log History
    await client
      .from("complaint_assignment_history")
      .insert({
        complaint_id: complaintId,
        assigned_to: staffId,
        assigned_by: user.id,
        assignment_notes: notes,
        assigned_at: now,
      });

    return data;
  },

  async reassignComplaint(client: SupabaseClient, complaintId: string, newStaffId: string, reason: string, note?: string) {
     return this.assignComplaint(client, complaintId, newStaffId, note);
  },

  async updateComplaintPriority(client: SupabaseClient, complaintId: string, priority: string, reason: string) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await client
      .from("complaints")
      .update({ priority: priority as any, updated_at: new Date().toISOString() })
      .eq("id", complaintId);

    if (error) throw error;

    await client.from("complaint_updates").insert({
      complaint_id: complaintId,
      update_type: "priority_change",
      reason: reason,
      new_status: priority, 
      created_by: user.id
    });
  },

  async addInternalNote(client: SupabaseClient, complaintId: string, text: string, tags: string[] = [], visibility: string = "internal_only") {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await client.from("internal_notes").insert({
      complaint_id: complaintId,
      author_id: user.id,
      text,
      tags,
      visibility
    });

    if (error) throw error;
  },

  async addComment(client: SupabaseClient, complaintId: string, content: string, isInternal: boolean = false) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await client
      .from("complaint_comments")
      .insert({
        complaint_id: complaintId,
        author_id: user.id,
        author_role: 'supervisor',
        content: content,
        is_internal: isInternal
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async closeComplaint(client: SupabaseClient, complaintId: string, closureNotes: string) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const now = new Date().toISOString();

    const { error } = await client
      .from("complaints")
      .update({
        status: "closed",
        closed_at: now,
        closed_by: user.id,
        resolution_notes: closureNotes,
      })
      .eq("id", complaintId);

    if (error) throw error;

    await client.from("complaint_updates").insert({
      complaint_id: complaintId,
      update_type: "closure",
      note: closureNotes,
      created_by: user.id
    });
  },

  async bulkAssignComplaints(client: SupabaseClient, complaintIds: string[], staffId: string, assignedBy: string) {
     const now = new Date().toISOString();
     const { data, error } = await client.from("complaints").update({
       assigned_staff_id: staffId,
       assigned_at: now,
       status: "assigned",
       updated_at: now
     }).in("id", complaintIds).select();
     if(error) throw error;
     return true;
  }
};