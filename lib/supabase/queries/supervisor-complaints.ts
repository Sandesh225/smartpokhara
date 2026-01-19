import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Data fetchers and mutations for Supervisor Complaint Management
 * FIXED: Correct relationship paths through users table
 */

interface SupervisorJurisdiction {
  assigned_wards: string[];
  assigned_departments: string[];
  is_senior: boolean;
}

export const supervisorComplaintsQueries = {
  /**
   * Get supervisor jurisdiction with robust error handling
   */
  async getJurisdiction(
    client: SupabaseClient
  ): Promise<SupervisorJurisdiction> {
    try {
      const { data, error } = await client
        .rpc("get_supervisor_jurisdiction")
        .single();

      if (error) {
        console.error("Jurisdiction RPC Error:", error);
        return {
          assigned_wards: [],
          assigned_departments: [],
          is_senior: false,
        };
      }

      if (!data) {
        return {
          assigned_wards: [],
          assigned_departments: [],
          is_senior: false,
        };
      }

      return {
        assigned_wards: data.assigned_wards || [],
        assigned_departments: data.assigned_departments || [],
        is_senior: data.is_senior || false,
      };
    } catch (err) {
      console.error("Failed to get jurisdiction:", err);
      return {
        assigned_wards: [],
        assigned_departments: [],
        is_senior: false,
      };
    }
  },

  async getJurisdictionComplaints(
    client: SupabaseClient,
    supervisorId: string,
    filters?: any,
    page = 1,
    pageSize = 50
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      // 1. Get jurisdiction with proper error handling
      const scope = await this.getJurisdiction(client);

      // 2. Build base query with CORRECT relationship path
      // FIXED: Use the foreign key hint to specify which users relationship to use
      let query = client.from("complaints").select(
        `
          *,
          ward:wards(id, name, ward_number),
          category:complaint_categories(id, name),
          assigned_staff:users!complaints_assigned_staff_id_fkey(
            id,
            profile:user_profiles(full_name)
          )
        `,
        { count: "exact" }
      );

      // 3. Apply jurisdictional filters
      if (!scope.is_senior) {
        const jurisdictionParts: string[] = [];

        if (scope.assigned_departments?.length > 0) {
          jurisdictionParts.push(
            `assigned_department_id.in.(${scope.assigned_departments.join(",")})`
          );
        }

        if (scope.assigned_wards?.length > 0) {
          jurisdictionParts.push(
            `ward_id.in.(${scope.assigned_wards.join(",")})`
          );
        }

        if (jurisdictionParts.length === 0) {
          console.warn("Supervisor has no assigned jurisdiction");
          return {
            data: [],
            count: 0,
            message: "No jurisdiction assigned. Contact administrator.",
          };
        }

        query = query.or(jurisdictionParts.join(","));
      }

      // 4. Apply user filters
      if (filters) {
        if (filters.status?.length) {
          query = query.in("status", filters.status);
        }
        if (filters.priority?.length) {
          query = query.in("priority", filters.priority);
        }
        if (filters.category?.length) {
          query = query.in("category_id", filters.category);
        }
        if (filters.ward_id?.length) {
          query = query.in("ward_id", filters.ward_id);
        }
        if (filters.assigned_staff_id) {
          query = query.eq("assigned_staff_id", filters.assigned_staff_id);
        }
        if (filters.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`
          );
        }
      }

      // 5. Execute query with pagination
      const { data, error, count } = await query
        .order("submitted_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Query execution error:", error);
        throw new Error(`Failed to fetch complaints: ${error.message}`);
      }

      // 6. Transform data to flatten the nested structure
      return {
        data: (data || []).map((c: any) => ({
          ...c,
          // Flatten assigned_staff for easier access
          assigned_staff: c.assigned_staff?.profile
            ? {
                id: c.assigned_staff.id,
                full_name: c.assigned_staff.profile.full_name,
              }
            : null,
        })),
        count: count || 0,
      };
    } catch (err) {
      console.error("Data Fetch Error:", err);
      throw err;
    }
  },

  /**
   * Fetch a single complaint with all details
   * FIXED: Correct relationship paths
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
        citizen:users!complaints_citizen_id_fkey(
          id, 
          email, 
          phone, 
          profile:user_profiles(full_name, profile_photo_url)
        ),
        assigned_staff_user:users!complaints_assigned_staff_id_fkey(
          id,
          profile:user_profiles(full_name, profile_photo_url),
          staff:staff_profiles(staff_code, staff_role)
        ),
        history:complaint_status_history(
          *,
          changed_by_user:users!complaint_status_history_changed_by_fkey(
            profile:user_profiles(full_name)
          )
        ),
        comments:complaint_comments(
          *,
          author:users!complaint_comments_author_id_fkey(
            id,
            profile:user_profiles(full_name, profile_photo_url)
          )
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

    // Flatten and transform the data
    const staffCode =
      data.assigned_staff_user?.staff?.[0]?.staff_code ||
      (data.assigned_staff_user
        ? `EMP-${data.assigned_staff_user.id.substring(0, 4).toUpperCase()}`
        : "UNASSIGNED");

    const flattenedComments = (data.comments || [])
      .map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        is_internal: c.is_internal,
        author_role: c.author_role,
        author_id: c.author_id,
        author_name: c.author?.profile?.full_name || "Unknown User",
        author_avatar: c.author?.profile?.profile_photo_url,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    return {
      data: {
        ...data,
        comments: flattenedComments,
        citizen: data.citizen?.profile
          ? {
              id: data.citizen.id,
              email: data.citizen.email,
              phone: data.citizen.phone,
              full_name: data.citizen.profile.full_name || "Unknown Citizen",
              avatar_url: data.citizen.profile.profile_photo_url,
            }
          : null,
        assigned_staff: data.assigned_staff_user?.profile
          ? {
              id: data.assigned_staff_user.id,
              full_name:
                data.assigned_staff_user.profile.full_name || "Staff Member",
              avatar_url: data.assigned_staff_user.profile.profile_photo_url,
              staff_code: staffCode,
            }
          : null,
      },
      error: null,
    };
  },

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

    await this.addComment(
      client,
      complaintId,
      `Priority changed to ${priority}. Reason: ${reason}`,
      true
    );

    return { success: true };
  },

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
  async getInternalNotes(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("internal_notes")
      .select(
        `
        *,
        author:users!internal_notes_supervisor_id_fkey(
          profile:user_profiles(full_name, avatar_url)
        )
      `
      )
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform to match the 'Note' interface in your component
    return (data || []).map((note) => ({
      ...note,
      author: {
        profile: {
          full_name: note.author?.profile?.full_name || "Unknown Supervisor",
          avatar_url: note.author?.profile?.avatar_url,
        },
      },
    }));
  },
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

    const { data, error } = await client
      .from("internal_notes")
      .insert({
        complaint_id: complaintId,
        supervisor_id: user.id,
        content: text, // Maps frontend 'text' to backend 'content'
        visibility: visibility,
        tags: tags,
      })
      .select(
        `
      *,
      author:users!internal_notes_supervisor_id_fkey (
        profile:user_profiles (
          full_name,
          profile_photo_url
        )
      )
    `
      )
      .single();

    if (error) {
      console.error("Detailed Supabase Error:", error.message);
      throw error;
    }

    // Transform to match your UI's expected 'Note' interface
    return {
      ...data,
      text: data.content, // Ensure the UI gets 'text'
      author_name: data.author?.profile?.full_name || "Unknown Supervisor",
      author_avatar: data.author?.profile?.profile_photo_url,
    };
  },
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

  async getUnassignedComplaints(client: SupabaseClient) {
    const scope = await this.getJurisdiction(client);

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

    if (!scope.is_senior) {
      const parts: string[] = [];
      if (scope.assigned_wards?.length)
        parts.push(`ward_id.in.(${scope.assigned_wards.join(",")})`);
      if (scope.assigned_departments?.length)
        parts.push(
          `assigned_department_id.in.(${scope.assigned_departments.join(",")})`
        );

      if (parts.length > 0) {
        query = query.or(parts.join(","));
      } else {
        return [];
      }
    }

    const { data, error } = await query.order("submitted_at", {
      ascending: false,
    });
    if (error) throw error;
    return data || [];
  },

  async getSLAComplaints(client: SupabaseClient, type: "at_risk" | "overdue") {
    const now = new Date().toISOString();
    let query = client
      .from("complaints")
      .select(
        `
        id, tracking_code, title, status, priority, sla_due_at, submitted_at,
        ward:wards(name, ward_number),
        assigned_staff:users!complaints_assigned_staff_id_fkey(
          profile:user_profiles(full_name)
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