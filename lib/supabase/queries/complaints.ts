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
    coordinates: [number, number]; // [Longitude, Latitude]
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
// COMPLAINTS SERVICE
// ============================================================================

// Helper to validate UUIDs
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

export const complaintsService = {
  // ========================================================================
  // 1. SUBMIT NEW COMPLAINT
  // ========================================================================
  async submitComplaint(
    data: SubmitComplaintRequest
  ): Promise<SubmitComplaintResponse> {
    try {
      const { data: result, error } = await supabase.rpc(
        "rpc_submit_complaint",
        {
          p_title: data.title,
          p_description: data.description,
          p_category_id: data.category_id,
          p_subcategory_id:
            data.subcategory_id && data.subcategory_id !== ""
              ? data.subcategory_id
              : null,
          p_ward_id: data.ward_id,
          p_location_point: data.location_point || null,
          p_address_text: data.address_text || null,
          p_landmark: data.landmark || null,
          p_priority: data.priority || "medium",
          p_is_anonymous: data.is_anonymous || false,
          p_phone: data.phone || null,
          p_source: data.source || "web",
        }
      );

      if (error) {
        console.error("Supabase RPC Error:", JSON.stringify(error, null, 2));
        throw new Error(
          error.message || "Failed to submit complaint due to a database error."
        );
      }

      return result as SubmitComplaintResponse;
    } catch (error: any) {
      console.error("Exception in submitComplaint:", error);
      throw new Error(
        error.message || "An unexpected error occurred while submitting."
      );
    }
  },

  // ========================================================================
  // 2. GET COMPLAINT BY ID WITH ALL RELATIONS (FIXED)
  // ========================================================================
  async getComplaintById(id: string): Promise<ComplaintWithRelations | null> {
    try {
      // 1. Validate ID Format first to prevent DB crashes
      if (!isValidUUID(id)) {
        return null;
      }

      // 2. Fetch Base Complaint
      const { data: complaint, error } = await supabase
        .from("complaints")
        .select(
          `
        *,
        category:complaint_categories!category_id(*),
        subcategory:complaint_subcategories!subcategory_id(*),
        ward:wards!ward_id(*),
        department:departments!assigned_department_id(*)
      `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching complaint:", error);
        throw error;
      }

      if (!complaint) return null;

      // 3. Parallel Fetch: Attachments, Comments, History, Work Logs
      const [attachmentsRes, commentsRes, historyRes, workLogsRes] =
        await Promise.all([
          supabase
            .from("complaint_attachments")
            .select("*")
            .eq("complaint_id", id)
            .order("created_at", { ascending: false }),

          supabase
            .from("complaint_comments")
            .select(
              `
          *,
          author:users!author_id(
            id, email,
            user_profiles(full_name, profile_photo_url)
          )
        `
            )
            .eq("complaint_id", id)
            .order("created_at", { ascending: true }),

          supabase
            .from("complaint_status_history")
            .select("*")
            .eq("complaint_id", id)
            .order("created_at", { ascending: true }),

          supabase
            .from("staff_work_logs")
            .select("photo_urls, created_at, staff_id")
            .eq("complaint_id", id)
            .eq("log_type", "completion_submitted"),
        ]);

      // 4. FIXED: Handle Staff Profile - Handle RLS policy restrictions
      let staff: StaffProfile | null = null;

      if (complaint.assigned_staff_id) {
        console.log("🔍 Fetching staff for ID:", complaint.assigned_staff_id);

        try {
          // Try to get staff_profiles - this might fail due to RLS
          const { data: staffData, error: staffError } = await supabase
            .from("staff_profiles")
            .select("*")
            .eq("user_id", complaint.assigned_staff_id)
            .maybeSingle();

          if (staffError) {
            console.error(
              "❌ Staff profile RLS blocked or error:",
              staffError.message || "Permission denied"
            );
            console.log(
              "ℹ️ This is likely an RLS policy issue. Citizens may not have permission to view staff_profiles table."
            );

            // FALLBACK: Try to at least get user_profiles which should be public
            const { data: publicProfile } = await supabase
              .from("user_profiles")
              .select("full_name, profile_photo_url")
              .eq("user_id", complaint.assigned_staff_id)
              .maybeSingle();

            if (publicProfile) {
              console.log("✅ Got staff info from public user_profiles table");
              // Create a minimal staff object with available data
              staff = {
                user_id: complaint.assigned_staff_id,
                staff_code: null,
                department_id: complaint.assigned_department_id,
                ward_id: null,
                staff_role: "staff_member", // Default role
                is_supervisor: false,
                is_active: true,
                max_concurrent_assignments: 0,
                current_workload: 0,
                specializations: null,
                employment_date: null,
                termination_date: null,
                metadata: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                profile: publicProfile,
              } as StaffProfile;
            } else {
              console.warn("⚠️ Could not fetch any staff information");
            }
          } else if (!staffData) {
            console.warn(
              `⚠️ No staff profile found for: ${complaint.assigned_staff_id}`
            );
          } else {
            console.log("✅ Step 1: Staff profile record found");

            // Get user_profiles record (should be publicly readable)
            const { data: profileData } = await supabase
              .from("user_profiles")
              .select("full_name, profile_photo_url")
              .eq("user_id", complaint.assigned_staff_id)
              .maybeSingle();

            // Combine all data
            staff = {
              user_id: staffData.user_id,
              staff_code: staffData.staff_code,
              department_id: staffData.department_id,
              ward_id: staffData.ward_id,
              staff_role: staffData.staff_role,
              is_supervisor: staffData.is_supervisor,
              is_active: staffData.is_active,
              max_concurrent_assignments: staffData.max_concurrent_assignments,
              current_workload: staffData.current_workload,
              specializations: staffData.specializations,
              employment_date: staffData.employment_date,
              termination_date: staffData.termination_date,
              metadata: staffData.metadata,
              created_at: staffData.created_at,
              updated_at: staffData.updated_at,
              profile: profileData || undefined,
            } as StaffProfile;

            console.log("✅ Staff profile loaded:", {
              user_id: staff.user_id,
              full_name: staff.profile?.full_name || "NO NAME",
              staff_role: staff.staff_role,
            });
          }
        } catch (err) {
          console.error("❌ Unexpected error fetching staff:", err);
        }
      }

      // 5. Transform Comments
      const transformedComments: ComplaintComment[] = (
        commentsRes.data || []
      ).map((comment: any) => {
        const author = comment.author;
        const profile = author?.user_profiles?.[0];

        const flattenedAuthor =
          author && profile
            ? {
                id: author.id as string,
                email: author.email as string,
                full_name: profile.full_name as string,
                profile_photo_url:
                  (profile.profile_photo_url as string | null) ?? null,
              }
            : undefined;

        const { author: _ignored, ...rest } = comment;

        return {
          ...(rest as ComplaintComment),
          author: flattenedAuthor,
        };
      });

      // 6. Merge Staff Proof Photos into Attachments
      const existingAttachments = (attachmentsRes.data ||
        []) as ComplaintAttachment[];
      const staffProofAttachments: ComplaintAttachment[] = [];

      if (workLogsRes.data) {
        workLogsRes.data.forEach((log: any) => {
          if (log.photo_urls && Array.isArray(log.photo_urls)) {
            log.photo_urls.forEach((url: string, index: number) => {
              staffProofAttachments.push({
                id: `proof-${log.staff_id}-${index}`,
                complaint_id: id,
                file_name: `Proof of Work ${index + 1}`,
                file_type: "image/jpeg",
                file_size: 0,
                file_path: url,
                thumbnail_url: null,
                uploaded_by: log.staff_id,
                uploaded_by_role: "staff",
                is_public: true,
                created_at: log.created_at,
              });
            });
          }
        });
      } else if (workLogsRes.error) {
        console.warn("Could not fetch staff work logs:", workLogsRes.error);
      }

      const allAttachments = [...existingAttachments, ...staffProofAttachments];

      return {
        ...(complaint as Complaint),
        attachments: allAttachments,
        comments: transformedComments,
        status_history: (historyRes.data || []) as ComplaintStatusHistory[],
        staff,
      } as ComplaintWithRelations;
    } catch (error) {
      console.error("Error in getComplaintById:", error);
      throw error;
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
  }): Promise<{
    complaints: ComplaintListItem[];
    total: number;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      let query = supabase
        .from("complaints")
        .select(
          `
          *,
          category:complaint_categories!category_id(name, icon, color),
          subcategory:complaint_subcategories!subcategory_id(name),
          ward:wards!ward_id(ward_number, name),
          department:departments!assigned_department_id(name)
        `,
          { count: "exact" }
        )
        .eq("citizen_id", user.id)
        .order(params?.sort_by || "submitted_at", {
          ascending: params?.sort_order === "ASC",
        });

      if (params?.status && params.status.length > 0) {
        query = query.in("status", params.status);
      }

      // Search functionality
      if (params?.search_term) {
        // ILIKE for case-insensitive search on title or tracking code
        query = query.or(
          `title.ilike.%${params.search_term}%,tracking_code.ilike.%${params.search_term}%`
        );
      }

      if (params?.priority && params.priority.length > 0) {
        query = query.in("priority", params.priority);
      }

      if (params?.category_id) {
        query = query.eq("category_id", params.category_id);
      }

      if (params?.ward_id) {
        query = query.eq("ward_id", params.ward_id);
      }

      const limit = params?.limit ?? 20;
      const offset = params?.offset ?? 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching user complaints:", error);
        throw error;
      }

      return {
        complaints: (data || []) as ComplaintListItem[],
        total: count || 0,
      };
    } catch (error) {
      console.error("Error in getUserComplaints:", error);
      throw error;
    }
  },

  // ========================================================================
  // 4. SEARCH COMPLAINTS (RPC)
  // ========================================================================
  async searchComplaints(
    params: SearchComplaintsParams
  ): Promise<SearchComplaintsResponse> {
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

      if (error) {
        console.error("Error searching complaints:", error);
        throw error;
      }

      return data as SearchComplaintsResponse;
    } catch (error) {
      console.error("Error in searchComplaints:", error);
      throw error;
    }
  },

  // ========================================================================
  // 5. ADD COMMENT
  //
  async addComment(
    complaintId: string,
    content: string,
    isInternal = false
  ): Promise<{ success: boolean; comment_id: string; message: string }> {
    try {
      const { data, error } = await supabase.rpc(
        "rpc_add_complaint_comment_v2",
        {
          p_complaint_id: complaintId,
          p_content: content,
          p_is_internal: isInternal,
        }
      );

      if (error) {
        console.error("Error adding comment:", error);
        throw error;
      }

      return data as {
        success: boolean;
        comment_id: string;
        message: string;
      };
    } catch (error) {
      console.error("Error in addComment:", error);
      throw error;
    }
  },
  // ========================================================================
  // 6. SUBMIT FEEDBACK
  // ========================================================================
  async submitFeedback(
    complaintId: string,
    feedback: {
      rating: number;
      issue_resolved: boolean;
      would_recommend: boolean;
      feedback_text?: string;
    }
  ): Promise<{ success: boolean; feedback_id: string; message: string }> {
    try {
      const { data, error } = await supabase.rpc("rpc_submit_feedback", {
        p_complaint_id: complaintId,
        p_rating: feedback.rating,
        p_issue_resolved: feedback.issue_resolved,
        p_would_recommend: feedback.would_recommend,
        p_feedback_text: feedback.feedback_text || null,
      });

      if (error) {
        console.error("Error submitting feedback:", error);
        throw error;
      }

      return data as {
        success: boolean;
        feedback_id: string;
        message: string;
      };
    } catch (error) {
      console.error("Error in submitFeedback:", error);
      throw error;
    }
  },

  // ========================================================================
  // 7. UPLOAD ATTACHMENT
  // ========================================================================
  async uploadAttachment(
    complaintId: string,
    file: File
  ): Promise<ComplaintAttachment> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User must be logged in to upload attachments");
      }

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${user.id}/${complaintId}/${timestamp}_${safeName}`;

      const { error: storageError } = await supabase.storage
        .from("complaint-attachments")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw storageError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("complaint-attachments").getPublicUrl(fileName);

      const { data, error: rpcError } = await supabase.rpc(
        "rpc_upload_complaint_attachment",
        {
          p_complaint_id: complaintId,
          p_file_name: file.name,
          p_file_type: file.type || null,
          p_file_size: file.size,
          p_file_path: publicUrl,
          p_thumbnail_url: null,
        }
      );

      if (rpcError) {
        console.error("DB insert error after upload:", rpcError);
        await supabase.storage.from("complaint-attachments").remove([fileName]);
        throw rpcError;
      }

      return data as ComplaintAttachment;
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      throw error;
    }
  },

  // ========================================================================
  // 8-10. GET METADATA (Categories, Wards)
  // ========================================================================
  async getCategories(): Promise<ComplaintCategory[]> {
    try {
      const { data, error } = await supabase
        .from("complaint_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return (data || []) as ComplaintCategory[];
    } catch (error) {
      console.error("Error in getCategories:", error);
      throw error;
    }
  },

  async getSubcategories(categoryId: string): Promise<ComplaintSubcategory[]> {
    try {
      const { data, error } = await supabase
        .from("complaint_subcategories")
        .select("*")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return (data || []) as ComplaintSubcategory[];
    } catch (error) {
      console.error("Error in getSubcategories:", error);
      throw error;
    }
  },

  async getWards(): Promise<Ward[]> {
    try {
      const { data, error } = await supabase
        .from("wards")
        .select("*")
        .eq("is_active", true)
        .order("ward_number");

      if (error) throw error;
      return (data || []) as Ward[];
    } catch (error) {
      console.error("Error in getWards:", error);
      throw error;
    }
  },

  // ========================================================================
  // 11-13. DASHBOARD STATS & STATUS UPDATES
  // ========================================================================
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data, error } = await supabase.rpc("rpc_get_dashboard_stats");
      if (error) throw error;
      return data as DashboardStats;
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      throw error;
    }
  },

  async getStatusHistory(
    complaintId: string
  ): Promise<ComplaintStatusHistory[]> {
    try {
      const { data, error } = await supabase
        .from("complaint_status_history")
        .select("*")
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as ComplaintStatusHistory[];
    } catch (error) {
      console.error("Error in getStatusHistory:", error);
      throw error;
    }
  },

  async updateStatus(
    complaintId: string,
    status: ComplaintStatus,
    note?: string
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const { error } = await supabase
        .from("complaints")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId);

      if (error) throw error;

      await supabase.from("complaint_status_history").insert({
        complaint_id: complaintId,
        new_status: status,
        changed_by: user.id,
        note: note || "Status updated by staff",
      });
    } catch (error) {
      console.error("Error in updateStatus:", error);
      throw error;
    }
  },

  async assignComplaint(
    complaintId: string,
    departmentId?: string,
    staffId?: string
  ): Promise<void> {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (departmentId) {
        updateData.assigned_department_id = departmentId;
        updateData.assigned_at = new Date().toISOString();
      }
      if (staffId) {
        updateData.assigned_staff_id = staffId;
        updateData.assigned_at = new Date().toISOString();
        updateData.status = "assigned";
      }
      const { error } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", complaintId);

      if (error) throw error;
    } catch (error) {
      console.error("Error in assignComplaint:", error);
      throw error;
    }
  },

  // ========================================================================
  // 14. HELPER FUNCTIONS (FIXED)
  // ========================================================================

  async canViewComplaint(complaintId: string): Promise<boolean> {
    try {
      // 1. Validate ID format first to prevent 500s
      if (!isValidUUID(complaintId)) {
        return false;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      // 2. Use maybeSingle to avoid errors on non-existent records
      const { data: complaint } = await supabase
        .from("complaints")
        .select("citizen_id")
        .eq("id", complaintId)
        .maybeSingle();

      if (!complaint) return false;

      return complaint.citizen_id === user.id;
    } catch (error) {
      console.error("Error in canViewComplaint:", error);
      return false;
    }
  },

  async getComplaintStats(
    timeRange: "day" | "week" | "month" | "year" = "month"
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      let dateFilter = "";
      switch (timeRange) {
        case "day":
          dateFilter = `DATE(submitted_at) = CURRENT_DATE`;
          break;
        case "week":
          dateFilter = `submitted_at >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case "month":
          dateFilter = `submitted_at >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
        case "year":
          dateFilter = `submitted_at >= CURRENT_DATE - INTERVAL '365 days'`;
          break;
      }

      const { data, error } = await supabase.rpc("get_complaint_statistics", {
        user_id: user.id,
        time_range: dateFilter,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error in getComplaintStats:", error);
      throw error;
    }
  },

  // ========================================================================
  // 15. REAL-TIME SUBSCRIPTIONS
  // ========================================================================

  subscribeToComplaint(complaintId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`complaint-${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
          filter: `id=eq.${complaintId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToComments(complaintId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`complaint-comments-${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_comments",
          filter: `complaint_id=eq.${complaintId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToStatus(complaintId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`complaint-status-${complaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_status_history",
          filter: `complaint_id=eq.${complaintId}`,
        },
        callback
      )
      .subscribe();
  },
};

export default complaintsService;