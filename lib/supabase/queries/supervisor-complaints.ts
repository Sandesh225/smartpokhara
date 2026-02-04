import { SupabaseClient } from "@supabase/supabase-js";
import { supervisorMessagesQueries } from "./supervisor-messages";

interface SupervisorJurisdiction {
  assigned_wards: string[];
  assigned_departments: string[];
  is_senior: boolean;
}

export const supervisorComplaintsQueries = {
  /**
   * Get supervisor jurisdiction
   */
  async getJurisdiction(
    client: SupabaseClient
  ): Promise<SupervisorJurisdiction> {
    try {
      const { data, error } = await client
        .rpc("get_supervisor_jurisdiction")
        .single();
      if (error || !data)
        return {
          assigned_wards: [],
          assigned_departments: [],
          is_senior: false,
        };
      return {
        assigned_wards: data.assigned_wards || [],
        assigned_departments: data.assigned_departments || [],
        is_senior: data.is_senior || false,
      };
    } catch (err) {
      console.error("Failed to get jurisdiction:", err);
      return { assigned_wards: [], assigned_departments: [], is_senior: false };
    }
  },

  /**
   * Get complaints within jurisdiction with filters
   * FIX: Updated FK relationship to point to user_profiles
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

    try {
      const scope = await this.getJurisdiction(client);

      // FIX: Changed 'assigned_staff:users!...' to 'assigned_staff:user_profiles!complaints_assigned_staff_profile_fkey'
      let query = client.from("complaints").select(
        `
          *,
          ward:wards(id, name, ward_number),
          category:complaint_categories(id, name),
          assigned_staff:user_profiles!complaints_assigned_staff_profile_fkey(
            user_id,
            full_name
          )
        `,
        { count: "exact" }
      );

      // Apply jurisdiction filters
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

        // Also allow complaints specifically assigned to this supervisor
        jurisdictionParts.push(`assigned_staff_id.eq.${supervisorId}`);

        if (jurisdictionParts.length === 0) {
          return {
            data: [],
            count: 0,
            message: "No jurisdiction assigned.",
          };
        }

        query = query.or(jurisdictionParts.join(","));
      }

      // Apply user filters
      if (filters) {
        if (filters.status?.length) query = query.in("status", filters.status);
        if (filters.priority?.length) query = query.in("priority", filters.priority);
        if (filters.category?.length) query = query.in("category_id", filters.category);
        if (filters.ward_id?.length) query = query.in("ward_id", filters.ward_id);
        if (filters.assigned_staff_id) query = query.eq("assigned_staff_id", filters.assigned_staff_id);
        if (filters.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`
          );
        }
      }

      const { data, error, count } = await query
        .order("submitted_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Query execution error:", error);
        throw new Error(`Failed to fetch complaints: ${error.message}`);
      }

      // FIX: Transform data using flat profile structure
      return {
        data: (data || []).map((c: any) => ({
          ...c,
          assigned_staff: c.assigned_staff
            ? {
                id: c.assigned_staff.user_id,
                full_name: c.assigned_staff.full_name,
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
   * Get single complaint by ID
   * FIX: Updated FK relationships for citizen and staff
   */
  async getComplaintById(client: SupabaseClient, id: string) {
    try {
      // Note: Citizen FK usually still points to users, but Staff FK now points to user_profiles
      // We join user_profiles -> staff_profiles to get role info
      const { data, error } = await client
        .from("complaints")
        .select(
          `
          *,
          ward:wards(*),
          category:complaint_categories(*),
          subcategory:complaint_subcategories(*),
          citizen:users!complaints_citizen_id_fkey(
            id, email, phone, 
            profile:user_profiles(full_name, profile_photo_url)
          ),
          assigned_staff_profile:user_profiles!complaints_assigned_staff_profile_fkey(
            user_id,
            full_name, 
            profile_photo_url,
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

      // Transform data
      const assignedProfile = data.assigned_staff_profile;
      const staffCode =
        assignedProfile?.staff?.[0]?.staff_code ||
        (assignedProfile ? `EMP-${assignedProfile.user_id.substring(0, 4).toUpperCase()}` : "UNASSIGNED");

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
          assigned_staff: assignedProfile
            ? {
                id: assignedProfile.user_id,
                full_name: assignedProfile.full_name || "Staff Member",
                avatar_url: assignedProfile.profile_photo_url,
                staff_code: staffCode,
              }
            : null,
        },
        error: null,
      };
    } catch (err) {
      console.error("getComplaintById error:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Get complaint attachments
   */
  async getComplaintAttachments(client: SupabaseClient, complaintId: string) {
    try {
      const { data, error } = await client
        .from("complaint_attachments")
        .select("*")
        .eq("complaint_id", complaintId);

      if (error) throw error;
      const files = data || [];

      return {
        citizenUploads: files.filter(
          (a) =>
            !a.uploaded_by_role ||
            a.uploaded_by_role.toLowerCase() === "citizen"
        ),
        staffUploads: files.filter(
          (a) =>
            a.uploaded_by_role &&
            [
              "staff",
              "admin",
              "supervisor",
              "dept_head",
              "ward_staff",
            ].includes(a.uploaded_by_role.toLowerCase())
        ),
      };
    } catch (err) {
      console.error("getComplaintAttachments error:", err);
      return { citizenUploads: [], staffUploads: [] };
    }
  },

  /**
   * Assign complaint to staff
   */
  async assignComplaint(
    client: SupabaseClient,
    complaintId: string,
    staffId: string,
    note: string,
    supervisorId: string
  ) {
    try {
      // 1. Update the Complaint Record
      const { error: updateError } = await client
        .from("complaints")
        .update({
          assigned_staff_id: staffId,
          status: "assigned",
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId);

      if (updateError) {
        console.error("Complaint Update Error:", updateError);
        throw new Error("Failed to update complaint record.");
      }

      // 2. Insert into History Log
      const { error: historyError } = await client
        .from("complaint_assignment_history")
        .insert({
          complaint_id: complaintId,
          assigned_to: staffId,
          assigned_by: supervisorId,
          assignment_notes: note,
        });

      if (historyError) {
        console.error("Assignment History Insert Error:", historyError);
      }

      return { success: true };
    } catch (err: any) {
      console.error("assignComplaint fatal error:", err);
      throw err;
    }
  },

  /**
   * Reassign complaint
   */
  async reassignComplaint(
    client: SupabaseClient,
    complaintId: string,
    newStaffId: string,
    reason: string,
    note: string,
    supervisorId: string,
    oldStaffId?: string
  ) {
    // 1. Update Complaint Record
    const { data: complaint, error } = await client
      .from("complaints")
      .update({
        assigned_staff_id: newStaffId,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", complaintId)
      .select("tracking_code, title")
      .single();

    if (error) throw error;

    // 2. Log to History Table
    await client.from("complaint_assignment_history").insert({
      complaint_id: complaintId,
      assigned_to: newStaffId,
      assigned_by: supervisorId,
      assignment_notes: `Reassigned from ${oldStaffId || "Unassigned"}: ${reason}`,
    });

    // 3. SEND SYSTEM MESSAGES
    // A. Notify the NEW Staff (Green Message)
    try {
      const convB = await supervisorMessagesQueries.createConversation(
        client,
        supervisorId,
        newStaffId
      );

      await supervisorMessagesQueries.sendMessage(
        client,
        convB,
        supervisorId,
        `[SYSTEM] 🟢 You have been assigned Task #${complaint.tracking_code}: "${complaint.title}". Please review ASAP.`
      );
    } catch (e) {
      console.error("Failed to notify new staff:", e);
    }

    // B. Notify the OLD Staff (Red Message) - Only if different
    if (oldStaffId && oldStaffId !== newStaffId) {
      try {
        const convA = await supervisorMessagesQueries.createConversation(
          client,
          supervisorId,
          oldStaffId
        );

        await supervisorMessagesQueries.sendMessage(
          client,
          convA,
          supervisorId,
          `[SYSTEM] 🔴 Task #${complaint.tracking_code} has been revoked and reassigned. Please stop work on this item.`
        );
      } catch (e) {
        console.error("Failed to notify old staff:", e);
      }
    }

    // C. Add System Comment
    try {
      await client.rpc("rpc_add_complaint_comment_v2", {
        p_complaint_id: complaintId,
        p_content: `[SYSTEM]: 🔄 Task reassigned to new staff. Reason: ${reason}`,
        p_is_internal: true,
      });
    } catch (e) {
      console.error("Failed to add system comment:", e);
    }

    return { success: true };
  },

  /**
   * Update complaint priority
   */
  async updateComplaintPriority(
    client: SupabaseClient,
    complaintId: string,
    priority: string,
    reason: string
  ) {
    try {
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
    } catch (err) {
      console.error("updateComplaintPriority error:", err);
      throw err;
    }
  },

  /**
   * Close complaint
   */
  async closeComplaint(
    client: SupabaseClient,
    complaintId: string,
    notes: string
  ) {
    try {
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
    } catch (err) {
      console.error("closeComplaint error:", err);
      throw err;
    }
  },

  /**
   * Get internal notes
   */
  async getInternalNotes(client: SupabaseClient, complaintId: string) {
    try {
      const { data, error } = await client
        .from("internal_notes")
        .select(
          `
          *,
          author:users!internal_notes_supervisor_id_fkey(
            profile:user_profiles(full_name, profile_photo_url)
          )
        `
        )
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((note) => ({
        ...note,
        author: {
          profile: {
            full_name: note.author?.profile?.full_name || "Unknown Supervisor",
            avatar_url: note.author?.profile?.profile_photo_url,
          },
        },
      }));
    } catch (err) {
      console.error("getInternalNotes error:", err);
      return [];
    }
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
    try {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await client
        .from("internal_notes")
        .insert({
          complaint_id: complaintId,
          supervisor_id: user.id,
          content: text,
          visibility: visibility,
          tags: tags,
        })
        .select(
          `
          *,
          author:users!internal_notes_supervisor_id_fkey(
            profile:user_profiles(full_name, profile_photo_url)
          )
        `
        )
        .single();

      if (error) throw error;

      return {
        ...data,
        text: data.content,
        author_name: data.author?.profile?.full_name || "Unknown Supervisor",
        author_avatar: data.author?.profile?.profile_photo_url,
      };
    } catch (err) {
      console.error("addInternalNote error:", err);
      throw err;
    }
  },

  /**
   * Add comment
   */
  async addComment(
    client: SupabaseClient,
    complaintId: string,
    content: string,
    isInternal: boolean = false
  ) {
    try {
      const { error } = await client.rpc("rpc_add_complaint_comment_v2", {
        p_complaint_id: complaintId,
        p_content: content,
        p_is_internal: isInternal,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("addComment error:", err);
      throw err;
    }
  },

  /**
   * Get unassigned complaints
   */
  async getUnassignedComplaints(client: SupabaseClient) {
    try {
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
    } catch (err) {
      console.error("getUnassignedComplaints error:", err);
      return [];
    }
  },

  /**
   * Get SLA complaints (at risk or overdue)
   * FIX: Updated FK to user_profiles
   */
  async getSLAComplaints(client: SupabaseClient, type: "at_risk" | "overdue") {
    try {
      const now = new Date().toISOString();
      let query = client
        .from("complaints")
        .select(
          `
          id, tracking_code, title, status, priority, sla_due_at, submitted_at,
          ward:wards(name, ward_number),
          assigned_staff:user_profiles!complaints_assigned_staff_profile_fkey(
            full_name
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
        assigned_staff_name: c.assigned_staff?.full_name || "Unassigned",
      }));
    } catch (err) {
      console.error("getSLAComplaints error:", err);
      return [];
    }
  },
};