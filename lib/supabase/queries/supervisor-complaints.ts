import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Data fetchers and mutations for Supervisor Complaint Management
 * Aligned with Smart City Pokhara Schema v4.0
 */
export const supervisorComplaintsQueries = {
  /**
   * Fetch complaints that the current supervisor has jurisdiction over.
   */
  async getJurisdictionComplaints(
    client: SupabaseClient,
    supervisorId: string,
    filters?: any,
    page = 1,
    pageSize = 50
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: scope } = await client
      .rpc("get_supervisor_jurisdiction")
      .single();

    let query = client.from("complaints").select(
      `
        *,
        ward:wards(id, name, ward_number),
        category:complaint_categories(id, name),
        assigned_user:users!complaints_assigned_staff_id_fkey(
          id,
          profile:user_profiles!user_profiles_user_id_fkey(full_name)
        )
      `,
      { count: "exact" }
    );

    if (scope && !scope.is_senior) {
      const parts = [];
      if (scope.assigned_wards?.length)
        parts.push(`ward_id.in.(${scope.assigned_wards.join(",")})`);
      if (scope.assigned_departments?.length)
        parts.push(
          `assigned_department_id.in.(${scope.assigned_departments.join(",")})`
        );
      parts.push(`assigned_staff_id.eq.${supervisorId}`);
      query = query.or(parts.join(","));
    }

    if (filters) {
      if (filters.status?.length) query = query.in("status", filters.status);
      if (filters.priority?.length)
        query = query.in("priority", filters.priority);
      if (filters.category?.length)
        query = query.in("category_id", filters.category);
      if (filters.search) query = query.ilike("title", `%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order("submitted_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data || []).map((c: any) => ({
        ...c,
        assigned_staff: c.assigned_user
          ? { full_name: c.assigned_user.profile?.full_name }
          : null,
      })),
      count: count || 0,
    };
  },

  /**
   * Fetch a single complaint with flattened profiles and resolved relationship ambiguity.
   * FIX: Added explicit relationship specifiers to resolve PGRST201 errors.
   */
  async getComplaintById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("complaints")
      .select(
        `
        *,
        ward:wards(*),
        category:complaint_categories(*),
        subcategory:complaint_subcategories(*),
        citizen_user:users!complaints_citizen_id_fkey(
          id, email, phone, 
          profile:user_profiles!user_profiles_user_id_fkey(full_name, profile_photo_url)
        ),
        assigned_user:users!complaints_assigned_staff_id_fkey(
          id, 
          profile:user_profiles!user_profiles_user_id_fkey(full_name, profile_photo_url), 
          staff:staff_profiles!staff_profiles_user_id_fkey(*) 
        ),
        history:complaint_status_history(*),
        updates:complaint_comments(
          *,
          author:users(profile:user_profiles!user_profiles_user_id_fkey(full_name, profile_photo_url))
        ),
        attachments:complaint_attachments(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error in getComplaintById:", error);
      return { data: null, error };
    }

    return {
      data: {
        ...data,
        citizen: data.citizen_user
          ? {
              id: data.citizen_user.id,
              email: data.citizen_user.email,
              phone: data.citizen_user.phone,
              full_name:
                data.citizen_user.profile?.full_name || "Unknown Citizen",
              avatar_url: data.citizen_user.profile?.profile_photo_url,
            }
          : null,
        assigned_staff: data.assigned_user
          ? {
              id: data.assigned_user.id,
              full_name:
                data.assigned_user.profile?.full_name || "Staff Member",
              avatar_url: data.assigned_user.profile?.profile_photo_url,
              staff_code: data.assigned_user.staff?.[0]?.staff_code,
            }
          : null,
      },
      error: null,
    };
  },

  /**
   * Fetch categorized attachments.
   * RESOLVED: Now exported correctly to fix Runtime TypeError.
   */
  async getComplaintAttachments(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("complaint_attachments")
      .select("*")
      .eq("complaint_id", complaintId);

    if (error) throw error;
    const files = data || [];

    return {
      citizenUploads: files.filter(
        (a) =>
          !a.uploaded_by_role || a.uploaded_by_role.toLowerCase() === "citizen"
      ),
      staffUploads: files.filter(
        (a) =>
          a.uploaded_by_role &&
          ["staff", "admin", "supervisor", "dept_head", "ward_staff"].includes(
            a.uploaded_by_role.toLowerCase()
          )
      ),
    };
  },

  /**
   * Core Assignment Logic
   */
  async assignComplaint(
    client: SupabaseClient,
    complaintId: string,
    staffId: string,
    note: string,
    supervisorId: string
  ) {
    // 1. Update the complaint record
    const { error: updateError } = await client
      .from("complaints")
      .update({
        assigned_staff_id: staffId,
        status: "assigned",
        assigned_at: new Date().toISOString(),
      })
      .eq("id", complaintId);

    if (updateError) {
      console.error("Complaint Update Error:", updateError);
      throw new Error(updateError.message);
    }

    // 2. Log to Assignment History (Triggers SQL Validation Trigger)
    const { error: historyError } = await client
      .from("complaint_assignment_history")
      .insert({
        complaint_id: complaintId,
        assigned_to: staffId,
        assigned_by: supervisorId,
        assignment_notes: note,
      });

    if (historyError) {
      console.error("Assignment History Error:", historyError);
      throw new Error(historyError.message);
    }

    return { success: true };
  },

  async reassignComplaint(
    client: SupabaseClient,
    complaintId: string,
    staffId: string,
    reason: string,
    note: string,
    supervisorId: string
  ) {
    return supervisorComplaintsQueries.assignComplaint(
      client,
      complaintId,
      staffId,
      `[Reassigned: ${reason}] ${note}`,
      supervisorId
    );
  },

  /**
   * Update Complaint Priority
   */
  async updateComplaintPriority(
    client: SupabaseClient,
    complaintId: string,
    priority: string,
    reason: string
  ) {
    const { error } = await client
      .from("complaints")
      .update({
        priority,
        updated_at: new Date().toISOString(),
      })
      .eq("id", complaintId);

    if (error) throw error;

    // Log internally as a comment
    await this.addComment(
      client,
      complaintId,
      `Priority changed to ${priority}. Reason: ${reason}`,
      true
    );

    return { success: true };
  },

  /**
   * Close/Resolve Complaint
   */
  async closeComplaint(
    client: SupabaseClient,
    complaintId: string,
    notes: string
  ) {
    const { error } = await client
      .from("complaints")
      .update({
        status: "closed",
        resolution_notes: notes,
        closed_at: new Date().toISOString(),
      })
      .eq("id", complaintId);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Fetch internal notes
   */
  async getInternalNotes(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("internal_notes")
      .select(
        `*, author:users!internal_notes_supervisor_id_fkey(profile:user_profiles!user_profiles_user_id_fkey(full_name))`
      )
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add internal note
   */
  async addInternalNote(
    client: SupabaseClient,
    complaintId: string,
    text: string,
    tags: string[],
    visibility: string
  ) {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await client.from("internal_notes").insert({
      complaint_id: complaintId,
      supervisor_id: user.id,
      content: text,
      visibility,
      tags,
    });

    if (error) throw error;
    return { success: true };
  },

  /**
   * Add public/staff comment
   */
  async addComment(
    client: SupabaseClient,
    complaintId: string,
    content: string,
    isInternal: boolean = false
  ) {
    const { error } = await client.rpc("rpc_add_complaint_comment", {
      p_complaint_id: complaintId,
      p_content: content,
      p_is_internal: isInternal,
    });

    if (error) throw error;
    return { success: true };
  },

  /**
   * Fetch complaints strictly unassigned within jurisdiction
   */
  async getUnassignedComplaints(client: SupabaseClient) {
    const { data: scope } = await client
      .rpc("get_supervisor_jurisdiction")
      .single();

    let query = client
      .from("complaints")
      .select(
        `
      *,
      ward:wards(id, name, ward_number),
      category:complaint_categories(id, name)
    `
      )
      .is("assigned_staff_id", null)
      .in("status", ["received", "under_review"]);

    if (scope && !scope.is_senior) {
      const parts = [];
      if (scope.assigned_wards?.length)
        parts.push(`ward_id.in.(${scope.assigned_wards.join(",")})`);
      if (scope.assigned_departments?.length)
        parts.push(
          `assigned_department_id.in.(${scope.assigned_departments.join(",")})`
        );
      query = query.or(parts.join(","));
    }

    const { data, error } = await query.order("submitted_at", {
      ascending: false,
    });
    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch complaints for SLA tracking
   */
  async getSLAComplaints(client: SupabaseClient, type: "at_risk" | "overdue") {
    const now = new Date().toISOString();
    let query = client
      .from("complaints")
      .select(
        `
      id, tracking_code, title, status, priority, sla_due_at, submitted_at,
      ward:wards(name, ward_number),
      assigned_staff:users!complaints_assigned_staff_id_fkey(
        profile:user_profiles!user_profiles_user_id_fkey(full_name)
      )
    `
      )
      .not("status", "in", '("resolved","closed")');

    if (type === "overdue") {
      query = query.lt("sla_due_at", now);
    } else {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      query = query
        .gte("sla_due_at", now)
        .lte("sla_due_at", tomorrow.toISOString());
    }

    const { data, error } = await query.order("sla_due_at", {
      ascending: true,
    });
    if (error) throw error;

    return (data || []).map((c: any) => ({
      ...c,
      assigned_staff_name: c.assigned_staff?.profile?.full_name || "Unassigned",
    }));
  },
};
