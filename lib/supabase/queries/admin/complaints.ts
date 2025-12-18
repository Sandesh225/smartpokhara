import { SupabaseClient } from "@supabase/supabase-js";
import { AdminComplaintListItem, ComplaintFiltersState } from "@/types/admin-complaints";

export const adminComplaintQueries = {
  /**
   * Fetch all complaints with filters, search, and pagination.
   */
  async getAllComplaints(
    client: SupabaseClient, 
    filters: ComplaintFiltersState, 
    page = 1, 
    pageSize = 20
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Base query with explicit Foreign Key hints to avoid ambiguity
    let query = client
      .from("complaints")
      .select(`
        id, tracking_code, title, description, status, priority, submitted_at, sla_due_at, ward_id,
        category:complaint_categories(name),
        ward:wards(name, ward_number),
        department:departments(name),
        citizen_data:users!complaints_citizen_id_fkey(
          email, 
          phone, 
          profile:user_profiles(full_name, profile_photo_url)
        ),
        assigned_user:users!complaints_assigned_staff_id_fkey(
           profile:user_profiles(full_name),
           staff_profile:staff_profiles(staff_code)
        )
      `, { count: 'exact' });

    // --- Apply Filters ---
    if (filters?.search) {
      const term = filters.search.trim();
      query = query.or(`tracking_code.ilike.%${term}%,title.ilike.%${term}%`);
    }

    if (filters?.status && filters.status.length > 0 && filters.status[0] !== 'all' as any) {
      query = query.in("status", filters.status);
    }

    if (filters?.priority && filters.priority.length > 0 && filters.priority[0] !== 'all' as any) {
      query = query.in("priority", filters.priority);
    }

    if (filters?.ward_id && filters.ward_id !== "all") {
      query = query.eq("ward_id", filters.ward_id);
    }

    if (filters?.date_range?.from) {
      query = query.gte("submitted_at", new Date(filters.date_range.from).toISOString());
    }
    
    if (filters?.date_range?.to) {
      query = query.lte("submitted_at", new Date(filters.date_range.to).toISOString());
    }

    // --- Pagination ---
    query = query
      .order("submitted_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase Error (getAllComplaints):", error);
      throw error;
    }

    // --- Helper for Safe Unwrapping ---
    const unwrap = (val: any) => (Array.isArray(val) ? val[0] : val);

    // --- Data Normalization ---
    const complaints: AdminComplaintListItem[] = (data || []).map((item: any) => {
      
      const citizenUser = unwrap(item.citizen_data);
      const citizenProfile = unwrap(citizenUser?.profile);
      
      const staffUser = unwrap(item.assigned_user);
      const staffProfile = unwrap(staffUser?.staff_profile);
      const staffUserProfile = unwrap(staffUser?.profile);

      const categoryObj = unwrap(item.category);
      const wardObj = unwrap(item.ward);
      const deptObj = unwrap(item.department);

      return {
        id: item.id,
        tracking_code: item.tracking_code,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        submitted_at: item.submitted_at,
        sla_due_at: item.sla_due_at,
        ward_id: item.ward_id,
        // Relations
        category: { name: categoryObj?.name || "Uncategorized" },
        ward: { 
          ward_number: wardObj?.ward_number || 0, 
          name: wardObj?.name || "Unknown" 
        },
        department: { name: deptObj?.name || "Unassigned" },
        // Flattened Citizen
        citizen: {
          full_name: citizenProfile?.full_name || "Anonymous",
          avatar_url: citizenProfile?.profile_photo_url,
          phone: citizenUser?.phone,
          email: citizenUser?.email
        },
        // Flattened Staff
        assigned_staff: staffUser ? {
          full_name: staffUserProfile?.full_name || "Staff",
          staff_code: staffProfile?.staff_code || "N/A"
        } : undefined
      };
    });

    return { data: complaints, count: count || 0 };
  },

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(client: SupabaseClient, ids: string[], status: string, adminId: string) {
    const { error } = await client
      .from("complaints")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .in("id", ids);

    if (error) throw error;
  },

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
          assigned_staff:users!complaints_assigned_staff_id_fkey(
             id, email, phone,
             profile:user_profiles(full_name, profile_photo_url),
             staff_profile:staff_profiles(staff_code)
          ),
          timeline:complaint_status_history(
             id, old_status, new_status, created_at, note, changed_by,
             actor:users(profile:user_profiles(full_name))
          ),
          attachments:complaint_attachments(*)
        `)
        .eq("id", id)
        .single();
  
      if (error) throw error;
      return data;
  },

  async assignComplaint(client: SupabaseClient, complaintId: string, staffId: string, adminId: string, notes?: string) {
    const now = new Date().toISOString();
    const { error } = await client.from("complaints").update({ assigned_staff_id: staffId, status: "assigned", assigned_at: now, updated_at: now }).eq("id", complaintId);
    if (error) throw error;
  }
};