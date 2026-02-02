import { supabase } from '../client';
import { Json } from '../../types/database.types';

// ============================================================================
// TYPE DEFINITIONS (Kept exactly as provided)
// ============================================================================

export interface Complaint {
  id: string;
  tracking_code: string;
  citizen_id: string;
  citizen_full_name: string;
  citizen_phone: string | null;
  citizen_email: string | null;
  title: string;
  description: string;
  category_id: string;
  subcategory_id: string | null;
  ward_id: string;
  location_point: any | null;
  address_text: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  is_anonymous: boolean;
  source: ComplaintSource;
  assigned_department_id: string | null;
  assigned_staff_id: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  sla_due_at: string | null;
  sla_breached_at: string | null;
  actual_resolution_days: number | null;
  upvote_count: number;
  comment_count: number;
  attachment_count: number;
  submitted_at: string;
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface ComplaintWithRelations extends Complaint {
  category: ComplaintCategory;
  subcategory: ComplaintSubcategory | null;
  ward: Ward;
  department: Department | null;
  staff: StaffProfile | null;
  attachments: ComplaintAttachment[];
  comments: ComplaintComment[];
  status_history: ComplaintStatusHistory[];
}

export interface ComplaintCategory {
  id: string;
  name: string;
  description: string | null;
  default_department_id: string | null;
  default_sla_days: number;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintSubcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  primary_department_id: string | null;
  default_sla_days: number | null;
  keywords: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  file_path: string;
  thumbnail_url: string | null;
  uploaded_by: string | null;
  uploaded_by_role: string | null;
  is_public: boolean;
  created_at: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  author_id: string;
  author_role: string;
  content: string;
  is_internal: boolean;
  attachments: Json;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    email: string;
    full_name: string;
    profile_photo_url: string | null;
  };
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_by: string | null;
  changed_by_role: string | null;
  note: string | null;
  created_at: string;
}

export interface ComplaintFeedback {
  id: string;
  complaint_id: string;
  citizen_id: string;
  rating: number | null;
  satisfaction_level: number | null;
  issue_fully_resolved: boolean | null;
  would_recommend: boolean | null;
  feedback_text: string | null;
  staff_responsiveness_rating: number | null;
  staff_professionalism_rating: number | null;
  resolution_speed_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  name_nepali: string | null;
  area_geometry: any;
  chairperson_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  name_nepali: string | null;
  code: string;
  description: string | null;
  head_user_id: string | null;
  is_active: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffProfile {
  user_id: string;
  staff_code: string | null;
  department_id: string | null;
  ward_id: string | null;
  staff_role: string;
  is_supervisor: boolean;
  is_active: boolean;
  max_concurrent_assignments: number;
  current_workload: number;
  specializations: string[] | null;
  employment_date: string | null;
  termination_date: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    phone: string | null;
  };
  profile?: {
    full_name: string;
    profile_photo_url: string | null;
  };
}

export type ComplaintListItem = Complaint & {
  category?: { name: string; icon: string | null; color: string | null };
  subcategory?: { name: string };
  ward?: { ward_number: number; name: string };
  department?: { name: string | null };
};

// ============================================================================
// ENUM TYPES
// ============================================================================

export type ComplaintStatus =
  | 'received'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected'
  | 'reopened';

export type ComplaintPriority =
  | 'critical'
  | 'urgent'
  | 'high'
  | 'medium'
  | 'low';

export type ComplaintSource =
  | 'web'
  | 'mobile'
  | 'call_center'
  | 'field_office'
  | 'email';

export type NotificationType =
  | 'complaint_status'
  | 'complaint_assigned'
  | 'comment_added'
  | 'new_notice'
  | 'bill_generated'
  | 'payment_success'
  | 'system_announcement'
  | 'feedback_received';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface SubmitComplaintRequest {
  title: string;
  description: string;
  category_id: string;
  subcategory_id?: string | null;
  ward_id: string;
  location_point?: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  address_text?: string | null;
  landmark?: string | null;
  priority?: ComplaintPriority;
  is_anonymous?: boolean;
  phone?: string | null;
  source?: ComplaintSource;
}

export interface SubmitComplaintResponse {
  success: boolean;
  complaint_id: string;
  tracking_code: string;
  message: string;
}

export interface SearchComplaintsParams {
  search_term?: string | null;
  status?: ComplaintStatus[];
  priority?: ComplaintPriority[];
  category_id?: string | null;
  ward_id?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  is_overdue?: boolean | null;
  sort_by?: 'submitted_at' | 'priority' | 'sla_due_at';
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface SearchComplaintsResponse {
  complaints: Array<
    Complaint & {
      category_name: string;
      subcategory_name: string | null;
      ward_number: number;
      department_name: string | null;
      is_overdue: boolean;
    }
  >;
  total: number;
  limit: number;
  offset: number;
}

export interface DashboardStats {
  complaints: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
  };
  bills: {
    total: number;
    pending: number;
    overdue: number;
    total_due: number;
  };
  notices: number;
  notifications: number;
}

// ============================================================================
// INTERNAL UTILITIES (DRY)
// ============================================================================

const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

const handleServiceError = (context: string, error: any): never => {
  console.error(`Exception in ${context}:`, error);
  throw new Error(error?.message || `An unexpected error occurred in ${context}.`);
};

const getAuthenticatedUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Authentication required");
  return user;
};

// ============================================================================
// COMPLAINTS SERVICE
// ============================================================================

export const complaintsService = {
  // ========================================================================
  // 1. SUBMIT NEW COMPLAINT
  // ========================================================================
  async submitComplaint(data: SubmitComplaintRequest): Promise<SubmitComplaintResponse> {
    try {
      const { data: result, error } = await supabase.rpc("rpc_submit_complaint", {
        p_title: data.title,
        p_description: data.description,
        p_category_id: data.category_id,
        p_subcategory_id: data.subcategory_id || null,
        p_ward_id: data.ward_id,
        p_location_point: data.location_point || null,
        p_address_text: data.address_text || null,
        p_landmark: data.landmark || null,
        p_priority: data.priority || "medium",
        p_is_anonymous: data.is_anonymous || false,
        p_phone: data.phone || null,
        p_source: data.source || "web",
      });

      if (error) throw error;
      return result as SubmitComplaintResponse;
    } catch (error) {
      return handleServiceError("submitComplaint", error);
    }
  },

  // ========================================================================
  // 2. GET COMPLAINT BY ID WITH ALL RELATIONS
  // ========================================================================
  async getComplaintById(id: string): Promise<ComplaintWithRelations | null> {
    try {
      if (!isValidUUID(id)) return null;

      const { data: complaint, error } = await supabase
        .from("complaints")
        .select(`
          *,
          category:complaint_categories!category_id(*),
          subcategory:complaint_subcategories!subcategory_id(*),
          ward:wards!ward_id(*),
          department:departments!assigned_department_id(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!complaint) return null;

      const [attachmentsRes, commentsRes, historyRes, workLogsRes] = await Promise.all([
        supabase.from("complaint_attachments").select("*").eq("complaint_id", id).order("created_at", { ascending: false }),
        supabase.from("complaint_comments").select(`*, author:users!author_id(id, email, user_profiles(full_name, profile_photo_url))`).eq("complaint_id", id).order("created_at", { ascending: true }),
        supabase.from("complaint_status_history").select("*").eq("complaint_id", id).order("created_at", { ascending: true }),
        supabase.from("staff_work_logs").select("photo_urls, created_at, staff_id").eq("complaint_id", id).eq("log_type", "completion_submitted"),
      ]);

      // Handle Staff logic (consolidated logic from original)
      let staff: StaffProfile | null = null;
      if (complaint.assigned_staff_id) {
        const { data: staffData } = await supabase.from("staff_profiles").select("*").eq("user_id", complaint.assigned_staff_id).maybeSingle();
        const { data: publicProfile } = await supabase.from("user_profiles").select("full_name, profile_photo_url").eq("user_id", complaint.assigned_staff_id).maybeSingle();

        if (staffData || publicProfile) {
          staff = {
            ...(staffData || {}),
            user_id: complaint.assigned_staff_id,
            profile: publicProfile || undefined,
          } as StaffProfile;
        }
      }

      // Map Comments
      const comments: ComplaintComment[] = (commentsRes.data || []).map((c: any) => ({
        ...c,
        author: c.author && c.author.user_profiles?.[0] ? {
          id: c.author.id,
          email: c.author.email,
          full_name: c.author.user_profiles[0].full_name,
          profile_photo_url: c.author.user_profiles[0].profile_photo_url,
        } : undefined
      }));

      // Merge proof photos
      const staffProofAttachments: ComplaintAttachment[] = [];
      workLogsRes.data?.forEach((log: any) => {
        log.photo_urls?.forEach((url: string, i: number) => {
          staffProofAttachments.push({
            id: `proof-${log.staff_id}-${i}`,
            complaint_id: id,
            file_name: `Proof of Work ${i + 1}`,
            file_path: url,
            uploaded_by: log.staff_id,
            uploaded_by_role: "staff",
            is_public: true,
            created_at: log.created_at,
          } as ComplaintAttachment);
        });
      });

      return {
        ...(complaint as Complaint),
        attachments: [...(attachmentsRes.data || []), ...staffProofAttachments],
        comments,
        status_history: (historyRes.data || []) as ComplaintStatusHistory[],
        staff,
      } as ComplaintWithRelations;
    } catch (error) {
      return handleServiceError("getComplaintById", error);
    }
  },

  // ========================================================================
  // 3. GET USER'S COMPLAINTS
  // ========================================================================
  async getUserComplaints(params?: {
    status?: ComplaintStatus[];
    priority?: ComplaintPriority[];
    category_id?: string;
    ward_id?: string;
    limit?: number;
    offset?: number;
    sort_by?: "submitted_at" | "priority" | "sla_due_at";
    sort_order?: "ASC" | "DESC";
    search_term?: string;
  }): Promise<{ complaints: ComplaintListItem[]; total: number }> {
    try {
      const user = await getAuthenticatedUser();

      let query = supabase
        .from("complaints")
        .select(`
          *,
          category:complaint_categories!category_id(name, icon, color),
          subcategory:complaint_subcategories!subcategory_id(name),
          ward:wards!ward_id(ward_number, name),
          department:departments!assigned_department_id(name)
        `, { count: "exact" })
        .eq("citizen_id", user.id)
        .order(params?.sort_by || "submitted_at", { ascending: params?.sort_order === "ASC" });

      if (params?.status?.length) query = query.in("status", params.status);
      if (params?.priority?.length) query = query.in("priority", params.priority);
      if (params?.category_id) query = query.eq("category_id", params.category_id);
      if (params?.ward_id) query = query.eq("ward_id", params.ward_id);
      if (params?.search_term) query = query.or(`title.ilike.%${params.search_term}%,tracking_code.ilike.%${params.search_term}%`);

      const limit = params?.limit ?? 20;
      const offset = params?.offset ?? 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return { complaints: (data || []) as ComplaintListItem[], total: count || 0 };
    } catch (error) {
      return handleServiceError("getUserComplaints", error);
    }
  },

  // ========================================================================
  // 4. SEARCH COMPLAINTS (RPC)
  // ========================================================================
  async searchComplaints(params: SearchComplaintsParams): Promise<SearchComplaintsResponse> {
    try {
      const { data, error } = await supabase.rpc("rpc_search_complaints", {
        p_search_term: params.search_term || null,
        p_status: params.status || null,
        p_priority: params.priority || null,
        p_category_id: params.category_id || null,
        p_ward_id: params.ward_id || null,
        p_date_from: params.date_from || null,
        p_date_to: params.date_to || null,
        p_is_overdue: params.is_overdue || null,
        p_sort_by: params.sort_by || "submitted_at",
        p_sort_order: params.sort_order || "DESC",
        p_limit: params.limit || 50,
        p_offset: params.offset || 0,
      });
      if (error) throw error;
      return data as SearchComplaintsResponse;
    } catch (error) {
      return handleServiceError("searchComplaints", error);
    }
  },

  // ========================================================================
  // 5. COMMENTS & FEEDBACK
  // ========================================================================
  async addComment(complaintId: string, content: string, isInternal = false) {
    try {
      const { data, error } = await supabase.rpc("rpc_add_complaint_comment_v2", {
        p_complaint_id: complaintId,
        p_content: content,
        p_is_internal: isInternal,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError("addComment", error);
    }
  },

  async submitFeedback(complaintId: string, feedback: { rating: number; issue_resolved: boolean; would_recommend: boolean; feedback_text?: string }) {
    try {
      const { data, error } = await supabase.rpc("rpc_submit_feedback", {
        p_complaint_id: complaintId,
        p_rating: feedback.rating,
        p_issue_resolved: feedback.issue_resolved,
        p_would_recommend: feedback.would_recommend,
        p_feedback_text: feedback.feedback_text || null,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError("submitFeedback", error);
    }
  },

  // ========================================================================
  // 7. UPLOAD ATTACHMENT
  // ========================================================================
  async uploadAttachment(complaintId: string, file: File): Promise<ComplaintAttachment> {
    try {
      const user = await getAuthenticatedUser();
      const fileName = `${user.id}/${complaintId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

      const { error: uploadErr } = await supabase.storage.from("complaint-attachments").upload(fileName, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("complaint-attachments").getPublicUrl(fileName);

      const { data, error: rpcError } = await supabase.rpc("rpc_upload_complaint_attachment", {
        p_complaint_id: complaintId,
        p_file_name: file.name,
        p_file_type: file.type || null,
        p_file_size: file.size,
        p_file_path: publicUrl,
        p_thumbnail_url: null,
      });

      if (rpcError) {
        await supabase.storage.from("complaint-attachments").remove([fileName]);
        throw rpcError;
      }

      return data as ComplaintAttachment;
    } catch (error) {
      return handleServiceError("uploadAttachment", error);
    }
  },

  // ========================================================================
  // METADATA FETCHING (DRY)
  // ========================================================================
  async getCategories() {
    try {
      const { data, error } = await supabase.from("complaint_categories").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return (data || []) as ComplaintCategory[];
    } catch (error) { return handleServiceError("getCategories", error); }
  },

  async getSubcategories(categoryId: string) {
    try {
      const { data, error } = await supabase.from("complaint_subcategories").select("*").eq("category_id", categoryId).eq("is_active", true).order("display_order");
      if (error) throw error;
      return (data || []) as ComplaintSubcategory[];
    } catch (error) { return handleServiceError("getSubcategories", error); }
  },

  async getWards() {
    try {
      const { data, error } = await supabase.from("wards").select("*").eq("is_active", true).order("ward_number");
      if (error) throw error;
      return (data || []) as Ward[];
    } catch (error) { return handleServiceError("getWards", error); }
  },

  // ========================================================================
  // DASHBOARD & STATUS UPDATES
  // ========================================================================
  async getDashboardStats() {
    try {
      const { data, error } = await supabase.rpc("rpc_get_dashboard_stats");
      if (error) throw error;
      return data as DashboardStats;
    } catch (error) { return handleServiceError("getDashboardStats", error); }
  },

  async getStatusHistory(complaintId: string) {
    try {
      const { data, error } = await supabase.from("complaint_status_history").select("*").eq("complaint_id", complaintId).order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as ComplaintStatusHistory[];
    } catch (error) { return handleServiceError("getStatusHistory", error); }
  },

  async updateStatus(complaintId: string, status: ComplaintStatus, note?: string) {
    try {
      const user = await getAuthenticatedUser();
      const { error: updateErr } = await supabase.from("complaints").update({ status, updated_at: new Date().toISOString() }).eq("id", complaintId);
      if (updateErr) throw updateErr;

      await supabase.from("complaint_status_history").insert({
        complaint_id: complaintId,
        new_status: status,
        changed_by: user.id,
        note: note || "Status updated by staff",
      });
    } catch (error) { return handleServiceError("updateStatus", error); }
  },

  async assignComplaint(complaintId: string, departmentId?: string, staffId?: string) {
    try {
      const now = new Date().toISOString();
      const updateData: any = { updated_at: now };
      if (departmentId) {
        updateData.assigned_department_id = departmentId;
        updateData.assigned_at = now;
      }
      if (staffId) {
        updateData.assigned_staff_id = staffId;
        updateData.assigned_at = now;
        updateData.status = "assigned";
      }
      const { error } = await supabase.from("complaints").update(updateData).eq("id", complaintId);
      if (error) throw error;
    } catch (error) { return handleServiceError("assignComplaint", error); }
  },

  // ========================================================================
  // HELPERS & STATS
  // ========================================================================
  async canViewComplaint(complaintId: string): Promise<boolean> {
    try {
      if (!isValidUUID(complaintId)) return false;
      const user = await getAuthenticatedUser();
      const { data } = await supabase.from("complaints").select("citizen_id").eq("id", complaintId).maybeSingle();
      return data?.citizen_id === user.id;
    } catch { return false; }
  },

  async getComplaintStats(timeRange: "day" | "week" | "month" | "year" = "month") {
    try {
      const user = await getAuthenticatedUser();
      const filters = { day: "1 day", week: "7 days", month: "30 days", year: "365 days" };
      const dateFilter = `submitted_at >= CURRENT_DATE - INTERVAL '${filters[timeRange]}'`;

      const { data, error } = await supabase.rpc("get_complaint_statistics", {
        user_id: user.id,
        time_range: dateFilter,
      });
      if (error) throw error;
      return data;
    } catch (error) { return handleServiceError("getComplaintStats", error); }
  },

  // ========================================================================
  // SUBSCRIPTIONS (DRY)
  // ========================================================================
  _createSubscription(channelName: string, table: string, filter: string, callback: (p: any) => void, event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*") {
    return supabase.channel(channelName).on("postgres_changes", { event, schema: "public", table, filter }, callback).subscribe();
  },

  subscribeToComplaint(id: string, cb: (p: any) => void) {
    return this._createSubscription(`complaint-${id}`, "complaints", `id=eq.${id}`, cb);
  },

  subscribeToComments(id: string, cb: (p: any) => void) {
    return this._createSubscription(`complaint-comments-${id}`, "complaint_comments", `complaint_id=eq.${id}`, cb, "INSERT");
  },

  subscribeToStatus(id: string, cb: (p: any) => void) {
    return this._createSubscription(`complaint-status-${id}`, "complaint_status_history", `complaint_id=eq.${id}`, cb, "INSERT");
  },
};

export default complaintsService;