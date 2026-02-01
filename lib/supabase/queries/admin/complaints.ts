// lib/supabase/queries/admin/complaints.ts

import { SupabaseClient } from "@supabase/supabase-js";
import {
  AdminComplaintListItem,
  ComplaintFiltersState,
} from "@/types/admin-complaints";

/**
 * Utility to handle Supabase's tendency to return objects as single-item arrays
 * when performing certain joins.
 */
const unwrap = (val: any) => (Array.isArray(val) ? val[0] : val);

export const adminComplaintQueries = {
  /**
   * Fetches a paginated list of complaints with full relational data
   * for the Admin Dashboard.
   */
  async getAllComplaints(
    client: SupabaseClient,
    filters: ComplaintFiltersState,
    page = 1,
    pageSize = 20
  ) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // ✅ FIX: The query now uses the constraints we just created in SQL
    // 1. assigned_staff_profile links to user_profiles
    // 2. staff_link nested inside links user_profiles to staff_profiles
    let query = client.from("complaints").select(
      `
        id, 
        tracking_code, 
        title, 
        description, 
        status, 
        priority, 
        submitted_at, 
        sla_due_at, 
        ward_id,
        category:complaint_categories(name),
        ward:wards(name, ward_number),
        department:departments(name),
        citizen_data:users!complaints_citizen_id_fkey(
          email, 
          phone, 
          profile:user_profiles(full_name, profile_photo_url)
        ),
        assigned_staff_profile:user_profiles!complaints_assigned_staff_profile_fkey(
           full_name,
           staff_link:staff_profiles!staff_profiles_user_profile_fkey(staff_code)
        )
      `,
      { count: "exact" }
    );

    // --- Filter Logic ---
    if (filters?.search) {
      const term = filters.search.trim();
      query = query.or(`tracking_code.ilike.%${term}%,title.ilike.%${term}%`);
    }

    if (filters?.status?.length > 0 && !filters.status.includes("all" as any)) {
      query = query.in("status", filters.status);
    }

    if (
      filters?.priority?.length > 0 &&
      !filters.priority.includes("all" as any)
    ) {
      query = query.in("priority", filters.priority);
    }

    if (filters?.ward_id && filters.ward_id !== "all") {
      query = query.eq("ward_id", filters.ward_id);
    }

    if (filters?.date_range?.from) {
      query = query.gte(
        "submitted_at",
        new Date(filters.date_range.from).toISOString()
      );
    }

    if (filters?.date_range?.to) {
      query = query.lte(
        "submitted_at",
        new Date(filters.date_range.to).toISOString()
      );
    }

    const { data, error, count } = await query
      .order("submitted_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(
        "Supabase Error (getAllComplaints):",
        JSON.stringify(error, null, 2)
      );
      throw new Error(error.message);
    }

    // --- Data Mapping ---
    const complaints: AdminComplaintListItem[] = (data || []).map(
      (item: any) => {
        // Safe unwrapping logic
        const citizenUser = unwrap(item.citizen_data);
        const citizenProfile = unwrap(citizenUser?.profile);

        // Staff Mapping
        const staffProfile = unwrap(item.assigned_staff_profile);
        const staffLink = unwrap(staffProfile?.staff_link);

        // Department Mapping
        const deptInfo = unwrap(item.department);

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

          category: { name: unwrap(item.category)?.name || "Uncategorized" },

          ward: {
            ward_number: unwrap(item.ward)?.ward_number || 0,
            name: unwrap(item.ward)?.name || "Unknown",
          },

          // ✅ FIX: Dept name mapping
          department: { name: deptInfo?.name || "Unassigned" },

          citizen: {
            full_name: citizenProfile?.full_name || "Anonymous",
            avatar_url: citizenProfile?.profile_photo_url,
            phone: citizenUser?.phone,
            email: citizenUser?.email,
          },

          assigned_staff: staffProfile
            ? {
                full_name: staffProfile.full_name || "Staff",
                staff_code: staffLink?.staff_code || "N/A",
              }
            : undefined,
        };
      }
    );

    return { data: complaints, count: count || 0 };
  },

  /**
   * Updates multiple complaints to a new status.
   */
  async bulkUpdateStatus(
    client: SupabaseClient,
    ids: string[],
    status: string,
    adminId: string
  ) {
    const { error } = await client
      .from("complaints")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      console.error("Bulk Update Error:", JSON.stringify(error));
      throw error;
    }
  },

  /**
   * Fetches detailed information for a single complaint including timeline.
   */
  async getComplaintById(client: SupabaseClient, id: string) {
    const { data, error } = await client
      .from("complaints")
      .select(
        `
          *,
          ward:wards(name, ward_number),
          category:complaint_categories(name, default_department_id),
          department:departments(name),
          citizen:users!complaints_citizen_id_fkey(
              id, email, phone,
              profile:user_profiles(full_name, profile_photo_url)
          ),
          /* ✅ FIX: Consistent Join for Single View */
          assigned_staff_profile:user_profiles!complaints_assigned_staff_profile_fkey(
              user_id, full_name, profile_photo_url,
              staff_link:staff_profiles!staff_profiles_user_profile_fkey(staff_code, staff_role)
          ),
          timeline:complaint_status_history(
              id, old_status, new_status, created_at, note, changed_by,
              actor:users(profile:user_profiles(full_name))
          ),
          attachments:complaint_attachments(*)
        `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    // ✅ FIX: Map detail view data safely
    const citizenUser = unwrap(data.citizen);
    const citizenProfile = unwrap(citizenUser?.profile);
    const staffProfile = unwrap(data.assigned_staff_profile);
    const staffLink = unwrap(staffProfile?.staff_link);

    return {
      ...data,
      citizen: {
        ...citizenUser,
        full_name: citizenProfile?.full_name || "Anonymous",
        avatar_url: citizenProfile?.profile_photo_url,
      },
      assigned_staff: staffProfile
        ? {
            id: staffProfile.user_id,
            full_name: staffProfile.full_name,
            avatar_url: staffProfile.profile_photo_url,
            staff_code: staffLink?.staff_code || "N/A",
            staff_role: staffLink?.staff_role || "Staff",
          }
        : null,
    };
  },

  /**
   * Assigns (or reassigns) a complaint to a staff member.
   */
  async assignComplaint(
    client: SupabaseClient,
    complaintId: string,
    staffId: string,
    adminId: string,
    notes?: string
  ) {
    const now = new Date().toISOString();

    const { error } = await client
      .from("complaints")
      .update({
        assigned_staff_id: staffId,
        status: "assigned",
        assigned_at: now,
        updated_at: now,
      })
      .eq("id", complaintId);

    if (error) throw error;

    if (notes) {
      await client.from("complaint_assignment_history").insert({
        complaint_id: complaintId,
        assigned_to: staffId,
        assigned_by: adminId,
        assignment_notes: notes,
      });
    }
  },
};
