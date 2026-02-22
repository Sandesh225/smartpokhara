import { SupabaseClient } from "@supabase/supabase-js";
import { staffApi } from "@/features/staff/api";
import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintPriority, 
  ComplaintFilters, 
  CreateComplaintData,
  ComplaintStats,
  SupervisorJurisdiction
} from "./types";

export const complaintsApi = {
  /**
   * Get User's Complaints (Citizen Dashboard)
   */
  
async getUserComplaints(
    client: SupabaseClient,
    userId: string,
    params: ComplaintFilters & { page?: number; pageSize?: number; sort_by?: string; sort_order?: string }
  ) {
    let query = client
      .from("complaints")
      // FIX: Removed the '!' exclamation marks to enable LEFT JOINS
      .select(`
        *,
        category:complaint_categories!complaints_category_id_fkey (name, icon, color),
        subcategory:complaint_subcategories!complaints_subcategory_id_fkey (name),
        ward:wards!complaints_ward_id_fkey (ward_number, name),
        department:departments!complaints_assigned_department_id_fkey (name)
      `, { count: "exact" })
      .eq("citizen_id", userId);

    // Apply Filters
    if (params.status?.length) query = query.in("status", params.status);
    if (params.priority?.length) query = query.in("priority", params.priority);
    if (params.category_id) query = query.eq("category_id", params.category_id);
    if (params.ward_id) query = query.eq("ward_id", params.ward_id);
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,tracking_code.ilike.%${params.search}%`);
    }

    // Sorting & Pagination
    const sortBy = params.sort_by || "submitted_at";
    const sortOrder = params.sort_order === "ASC";
    query = query.order(sortBy, { ascending: sortOrder });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { 
      data: (data || []) as Complaint[], 
      total: count || 0 
    };
  },
  /**
   * Fetch a single complaint by ID with all relations
   */
  async getComplaintById(client: SupabaseClient, id: string) {
  // Use a standard select to allow RLS to handle the heavy lifting.
  // We remove the "!" to ensure LEFT JOINS for assigned_staff and subcategory.
  const { data, error } = await client
    .from("complaints")
    .select(`
      *,
      category:complaint_categories (id, name, icon, color),
      subcategory:complaint_subcategories (id, name),
      ward:wards (id, ward_number, name),
      department:departments (id, name),
      citizen:users!complaints_citizen_id_fkey (
          id, email, phone,
          profile:user_profiles (full_name, profile_photo_url)
      ),
      assigned_staff_profile:user_profiles!complaints_assigned_staff_profile_fkey (
          user_id, 
          full_name, 
          profile_photo_url,
          staff:staff_profiles!staff_profiles_user_profile_fkey (
            staff_code, 
            staff_role
          )
      )
    `)
    .eq("id", id)
    .maybeSingle(); // Use maybeSingle to avoid throwing errors if 0 rows are returned

  if (error) {
    console.error("Detail Fetch Error:", JSON.stringify(error, null, 2));
    return null;
  }

  return data;
},
  /**
   * Fetch complaint specific details (Attachments, Comments, History)
   */
  async getComplaintDetails(client: SupabaseClient, id: string) {
    const [attachments, comments, history, workLogs] = await Promise.all([
      client.from("complaint_attachments").select("*").eq("complaint_id", id).order("created_at", { ascending: false }),
      client.from("complaint_comments").select(`
        *,
        author:users!complaint_comments_author_id_fkey(
          id, email,
          profile:user_profiles(full_name, profile_photo_url)
        )
      `).eq("complaint_id", id).order("created_at", { ascending: true }),
      client.from("complaint_status_history").select(`
        *, 
        changed_by_user:users!complaint_status_history_changed_by_fkey(
          profile:user_profiles(full_name)
        )
      `).eq("complaint_id", id).order("created_at", { ascending: true }),
      client.from("staff_work_logs").select("photo_urls, created_at, staff_id").eq("complaint_id", id).eq("log_type", "completion_submitted"),
    ]);

    return {
      attachments: attachments.data || [],
      comments: comments.data || [],
      history: history.data || [],
      workLogs: workLogs.data || []
    };
  },

  /**
   * Create a new complaint using RPC
   */
  async createComplaint(client: SupabaseClient, data: CreateComplaintData) {
    const { data: result, error } = await client.rpc("rpc_submit_complaint_v2", {
        p_title: data.title,
        p_description: data.description,
        p_category_id: data.category_id,
        p_subcategory_id: data.subcategory_id || null,
        p_ward_id: data.ward_id,
        p_location_point: data.location_point || null,
        p_address_text: data.address_text || null,
        p_landmark: data.landmark || null,
        p_priority: "medium", // Default
        p_is_anonymous: data.is_anonymous || false,
        p_phone: data.phone || null,
        p_source: "web"
    });

    if (error) throw error;
    
    // Check for application-level error returned by RPC
    if (result && result.success === false) {
      throw new Error(result.error || "Failed to submit complaint");
    }

    return result;
  },

  /**
   * Search complaints with filters (Perfectly aligned with RPC signature)
   */
  async searchComplaints(
    client: SupabaseClient,
    params: ComplaintFilters & { page?: number; pageSize?: number; is_overdue?: boolean; sort_by?: string; sort_order?: string }
  ) {
    const {
      search,
      status,
      priority,
      category_id,
      ward_id,
      dateRange,
      is_overdue,
      sort_by = 'submitted_at',
      sort_order = 'DESC',
      page = 1,
      pageSize = 10
    } = params;

    // 1. Build the base query leveraging RLS policies
    let query = client
      .from("complaints")
      .select(`
        *,
        category:complaint_categories!category_id(id, name, icon, color),
        subcategory:complaint_subcategories!subcategory_id(id, name),
        ward:wards!ward_id(id, ward_number, name),
        department:departments!assigned_department_id(id, name),
        citizen:users!complaints_citizen_id_fkey(email, profile:user_profiles(full_name)),
        assigned_staff:user_profiles!complaints_assigned_staff_profile_fkey(full_name)
      `, { count: "exact" });

    // 2. Apply Filters dynamically
    if (search) {
      query = query.or(`title.ilike.%${search}%,tracking_code.ilike.%${search}%`);
    }
    if (status?.length) query = query.in("status", status);
    if (priority?.length) query = query.in("priority", priority);
    if (category_id) query = query.eq("category_id", category_id);
    if (ward_id) query = query.eq("ward_id", ward_id);
    
    if (dateRange?.from) query = query.gte("submitted_at", dateRange.from.toISOString());
    if (dateRange?.to) query = query.lte("submitted_at", dateRange.to.toISOString());

    if (is_overdue) {
      query = query
        .lt("sla_due_at", new Date().toISOString())
        .not("status", "in", '("resolved","closed","rejected")');
    }

    // 3. Sorting & Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order(sort_by, { ascending: sort_order === 'ASC' })
      .range(from, to);

    // 4. Execute Query
    const { data, error, count } = await query;

    if (error) {
      console.error("Search Complaints Error:", error);
      throw error;
    }

    return {
      data: (data || []) as Complaint[],
      total: count || 0
    };
  },
  /**
   * Update Complaint Status
   */
  async updateStatus(
    client: SupabaseClient,
    id: string,
    status: ComplaintStatus,
    userId: string,
    note?: string
  ) {
    const { error } = await client.from("complaints").update({ status }).eq("id", id);
    if (error) throw error;

    await client.from("complaint_status_history").insert({
      complaint_id: id,
      new_status: status,
      changed_by: userId,
      note: note
    });
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

    await this.addComment(
      client,
      complaintId,
      `Priority changed to ${priority}. Reason: ${reason}`,
      true
    );
  },

  /**
   * Assign Complaint
   */
  async assignComplaint(
    client: SupabaseClient,
    complaintId: string,
    staffId: string,
    assignerId: string,
    note?: string
  ) {
    const { error } = await client.from("complaints").update({
        assigned_staff_id: staffId,
        status: "assigned",
        assigned_at: new Date().toISOString()
    }).eq("id", complaintId);

    if (error) throw error;

    await client.from("complaint_assignment_history").insert({
        complaint_id: complaintId,
        assigned_to: staffId,
        assigned_by: assignerId,
        assignment_notes: note
    });
  },

  /**
   * Add Comment
   */
  async addComment(
    client: SupabaseClient,
    complaintId: string,
    content: string,
    isInternal: boolean = false
  ) {
      return client.rpc("rpc_add_complaint_comment_v2", {
          p_complaint_id: complaintId,
          p_content: content,
          p_is_internal: isInternal
      });
  },

  /**
   * Upload Attachment
   */
  async uploadAttachment(client: SupabaseClient, complaintId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${complaintId}/${fileName}`;

    const { error: uploadError } = await client.storage
      .from("complaint-attachments")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = client.storage
      .from("complaint-attachments")
      .getPublicUrl(filePath);

    const { data: dbResult, error: dbError } = await client
      .rpc("rpc_upload_complaint_attachment", {
        p_complaint_id: complaintId,
        p_file_path: publicUrl,
        p_file_name: file.name,
        p_file_type: file.type,
        p_file_size: file.size
      });

    if (dbError) throw dbError;
    if (dbResult && dbResult.success === false) {
        throw new Error(dbResult.error || "Failed to link attachment");
    }
    return publicUrl;
  },

  /**
   * Get User Stats
   */
  async getUserStats(client: SupabaseClient, userId: string): Promise<ComplaintStats> {
     const { data, error } = await client
      .from("complaints")
      .select("status")
      .eq("citizen_id", userId);

    if (error) throw error;

    return {
      total: data.length,
      open: data.filter(c => c.status === "received" || c.status === "under_review").length,
      in_progress: data.filter(c => c.status === "in_progress" || c.status === "assigned").length,
      resolved: data.filter(c => c.status === "resolved" || c.status === "closed").length,
    };
  },

  /**
   * Get Supervisor Jurisdiction
   */
  async getJurisdiction(client: SupabaseClient): Promise<SupervisorJurisdiction> {
    try {
      const { data, error } = await client
        .rpc("get_supervisor_jurisdiction")
        .single();

      if (error || !data) return { assigned_wards: [], assigned_departments: [], is_senior: false };

      const jurisdiction = data as any;

      return {
        assigned_wards: jurisdiction.assigned_wards || [],
        assigned_departments: jurisdiction.assigned_departments || [],
        is_senior: jurisdiction.is_senior || false,
      };
    } catch (err) {
      console.error("Failed to get jurisdiction:", err);
      return { assigned_wards: [], assigned_departments: [], is_senior: false };
    }
  },

  /**
   * Get Complaints in Jurisdiction
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
      const scope = await complaintsApi.getJurisdiction(client);

      let query = client.from("complaints").select(
        `
          *,
          ward:wards(id, name, ward_number),
          category:complaint_categories(id, name),
          citizen:users!complaints_citizen_id_fkey(email, profile:user_profiles(full_name)),
          assigned_staff:user_profiles!complaints_assigned_staff_profile_fkey(
            user_id,
            full_name
          )
        `,
        { count: "exact" }
      );

      // Apply jurisdiction filters
      if (!scope.is_senior) {
        const deptCond = scope.assigned_departments?.length > 0 ? `assigned_department_id.in.(${scope.assigned_departments.join(",")})` : null;
        const wardCond = scope.assigned_wards?.length > 0 ? `ward_id.in.(${scope.assigned_wards.join(",")})` : null;

        let baseCond = "";
        if (deptCond && wardCond) {
          // AND them so a Ward-Road supervisor only sees Road complaints in their Ward
          baseCond = `and(${deptCond},${wardCond})`;
        } else if (deptCond) {
          baseCond = deptCond;
        } else if (wardCond) {
          baseCond = wardCond;
        }

        if (baseCond) {
          // Can see jurisdiction OR direct assignments
          query = query.or(`${baseCond},assigned_staff_id.eq.${supervisorId}`);
        } else {
          // Only direct assignments
          query = query.eq("assigned_staff_id", supervisorId);
        }
      }

      // Apply user filters
      if (filters) {
        if (filters.status?.length) query = query.in("status", filters.status);
        if (filters.priority?.length) query = query.in("priority", filters.priority);
        if (filters.category?.length) query = query.in("category_id", filters.category);
        if (filters.ward_id?.length) query = query.in("ward_id", filters.ward_id);
        if (filters.assigned_staff_id) query = query.eq("assigned_staff_id", filters.assigned_staff_id);
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`);
        }
      }

      const { data, error, count } = await query
        .order("submitted_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: (data || []).map((c: any) => ({
          ...c,
          assigned_staff: c.assigned_staff ? {
            id: c.assigned_staff.user_id,
            full_name: c.assigned_staff.full_name,
          } : null,
        })),
        count: count || 0,
      };
    } catch (err) {
      console.error("Data Fetch Error:", err);
      throw err;
    }
  },

  /**
   * Get Unassigned Complaints
   */
  async getUnassignedComplaints(client: SupabaseClient) {
    try {
      const scope = await complaintsApi.getJurisdiction(client);

      let query = client.from("complaints")
        .select(`*, ward:wards(id, name, ward_number), category:complaint_categories(id, name), citizen:users!complaints_citizen_id_fkey(email, profile:user_profiles(full_name))`)
        .is("assigned_staff_id", null)
        .in("status", ["received", "under_review"]);

      if (!scope.is_senior) {
        if (!scope.assigned_wards?.length && !scope.assigned_departments?.length) {
          return []; // If they supervise nothing, they see no unassigned complaints
        }

        if (scope.assigned_wards?.length) {
          query = query.in("ward_id", scope.assigned_wards);
        }
        if (scope.assigned_departments?.length) {
          query = query.in("assigned_department_id", scope.assigned_departments);
        }
      }

      const { data, error } = await query.order("submitted_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("getUnassignedComplaints error:", err);
      return [];
    }
  },

  /**
   * Reassign Complaint
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
      const convB = await staffApi.createConversation(
        client,
        supervisorId,
        newStaffId
      );

      await staffApi.sendMessage(
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
        const convA = await staffApi.createConversation(
          client,
          supervisorId,
          oldStaffId
        );

        await staffApi.sendMessage(
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
        p_is_internal: true
      });
    } catch (e) {
      console.error("Failed to add system comment:", e);
    }

    return { success: true };
  },

  /**
   * Close Complaint
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
   * Get Internal Notes
   */
  async getInternalNotes(client: SupabaseClient, complaintId: string) {
    try {
      const { data, error } = await client
        .from("internal_notes")
        .select(`
          *,
          author:users!internal_notes_supervisor_id_fkey(
            profile:user_profiles(full_name, profile_photo_url)
          )
        `)
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
   * Add Internal Note
   */
  async addInternalNote(
    client: SupabaseClient,
    complaintId: string,
    text: string,
    tags: string[],
    visibility: string
  ) {
    const { data: { user } } = await client.auth.getUser();
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
      .select(`
          *,
          author:users!internal_notes_supervisor_id_fkey(
            profile:user_profiles(full_name, profile_photo_url)
          )
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      author: {
        full_name: data.author?.profile?.full_name || "Unknown Supervisor",
        avatar_url: data.author?.profile?.profile_photo_url,
      },
    };
  },

  /**
   * Get Categories
   */
  async getCategories(client: SupabaseClient) {
    const { data, error } = await client
      .from("complaint_categories")
      .select("*")
      .order("name");
    
    if (error) throw error;
    return data;
  },

  /**
   * Get Wards
   */
  async getWards(client: SupabaseClient) {
    const { data, error } = await client
      .from("wards")
      .select("*")
      .order("ward_number");
    
    if (error) throw error;
    return data;
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
            a.uploaded_by_role.toLowerCase() !== "citizen"
        ),
      };
    } catch (err) {
      console.error("getComplaintAttachments error:", err);
      return { citizenUploads: [], staffUploads: [] };
    }
  },

  /**
   * Get SLA complaints (at risk or overdue)
   */
  async getSLAComplaints(client: SupabaseClient, type: "at_risk" | "overdue") {
    try {
      const now = new Date().toISOString();
      let query = client
        .from("complaints")
        .select(`
          id, tracking_code, title, status, priority, sla_due_at, submitted_at,
          ward:wards(name, ward_number),
          assigned_staff:user_profiles!complaints_assigned_staff_profile_fkey(
            full_name
          )
        `)
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

      const { data, error } = await query.order("sla_due_at", { ascending: true });

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

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(
    client: SupabaseClient,
    ids: string[],
    status: string,
    userId: string
  ) {
    const { error } = await client
      .from("complaints")
      .update({ status })
      .in("id", ids);

    if (error) throw error;

    const historyEntries = ids.map(id => ({
      complaint_id: id,
      new_status: status,
      changed_by: userId,
      note: "Bulk status update via Admin Console"
    }));

    const { error: historyError } = await client
      .from("complaint_status_history")
      .insert(historyEntries);
      
    if (historyError) console.error("Bulk history error", historyError);
  },

  /**
   * Bulk assign complaints
   */
  async bulkAssignComplaints(
    client: SupabaseClient,
    complaintIds: string[],
    staffId: string,
    supervisorId: string
  ) {
    try {
      const { error: updateError } = await client
        .from("complaints")
        .update({
          assigned_staff_id: staffId,
          status: "assigned",
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in("id", complaintIds);

      if (updateError) throw updateError;

      const historyEntries = complaintIds.map(id => ({
        complaint_id: id,
        assigned_to: staffId,
        assigned_by: supervisorId,
        assignment_notes: "Bulk Assignment",
      }));

      const { error: historyError } = await client
        .from("complaint_assignment_history")
        .insert(historyEntries);

      if (historyError) console.error("Bulk history error", historyError);

      return { success: true };
    } catch (err) {
      console.error("bulkAssignComplaints error:", err);
      throw err;
    }
  },

  /**
   * Get Subcategories for a Category
   */
  async getSubcategories(client: SupabaseClient, categoryId: string) {
    const { data, error } = await client
      .from("complaint_subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("name");
    
    if (error) throw error;
    return data;
  },

  /**
   * Submit Feedback for a resolved complaint
   */
  async submitFeedback(
    client: SupabaseClient, 
    complaintId: string, 
    feedback: { 
      rating: number; 
      issue_resolved: boolean; 
      would_recommend: boolean; 
      feedback_text?: string 
    }
  ) {
    const { data, error } = await client.rpc("rpc_submit_feedback", {
      p_complaint_id: complaintId,
      p_rating: feedback.rating,
      p_issue_resolved: feedback.issue_resolved,
      p_would_recommend: feedback.would_recommend,
      p_feedback_text: feedback.feedback_text || null,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get Dashboard Statistics (Admin/Staff)
   */
  async getDashboardStats(client: SupabaseClient) {
    const { data, error } = await client.rpc("rpc_get_dashboard_stats");
    if (error) throw error;
    return data;
  },

  /**
   * Check if user can view a complaint (Citizen restriction)
   */
  async canViewComplaint(client: SupabaseClient, complaintId: string, userId: string) {
    const { data, error } = await client
      .from("complaints")
      .select("citizen_id")
      .eq("id", complaintId)
      .maybeSingle();
    
    if (error || !data) return false;
    return data.citizen_id === userId;
  },

  /**
   * Get Status History for a complaint
   */
  async getStatusHistory(client: SupabaseClient, complaintId: string) {
    const { data, error } = await client
      .from("complaint_status_history")
      .select(`
        *,
        changed_by_user:users!complaint_status_history_changed_by_fkey(
          profile:user_profiles(full_name)
        )
      `)
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * REALTIME SUBSCRIPTIONS
   */

  subscribeToComplaint(client: SupabaseClient, id: string, callback: (payload: any) => void) {
    return client
      .channel(`complaint-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `id=eq.${id}` }, callback)
      .subscribe();
  },

  subscribeToComments(client: SupabaseClient, id: string, callback: (payload: any) => void) {
    return client
      .channel(`complaint-comments-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "complaint_comments", filter: `complaint_id=eq.${id}` }, callback)
      .subscribe();
  },

  subscribeToStatus(client: SupabaseClient, id: string, callback: (payload: any) => void) {
    return client
      .channel(`complaint-status-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "complaint_status_history", filter: `complaint_id=eq.${id}` }, callback)
      .subscribe();
  }
};