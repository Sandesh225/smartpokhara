import { SupabaseClient } from "@supabase/supabase-js";

export const supervisorLeaveQueries = {
  // ... existing getPendingRequests ...
  
  /**
   * Fetch pending requests for a specific Supervisor based on jurisdiction.
   */
  async getPendingRequests(client: SupabaseClient, supervisorId: string) {
    // 1. Get Supervisor's Jurisdiction
    const { data: supervisor, error: supError } = await client
      .from("supervisor_profiles")
      .select("assigned_departments, assigned_wards")
      .eq("user_id", supervisorId)
      .single();

    if (supError || !supervisor) {
        if (supError && supError.code !== 'PGRST116') {
            console.error("Supervisor profile fetch error:", supError);
        }
        return [];
    }

    const depts = supervisor.assigned_departments || [];
    const wards = supervisor.assigned_wards || [];

    if (depts.length === 0 && wards.length === 0) return [];

    const orFilters = [];
    if (depts.length > 0) orFilters.push(`department_id.in.(${depts.join(',')})`);
    if (wards.length > 0) orFilters.push(`ward_id.in.(${wards.join(',')})`);
    
    if (orFilters.length === 0) return [];

    const { data: staffList, error: staffError } = await client
      .from("staff_profiles")
      .select("user_id")
      .or(orFilters.join(','));

    if (staffError) return [];

    const staffIds = staffList.map(s => s.user_id);
    if (staffIds.length === 0) return [];

    const { data: requests, error: reqError } = await client
      .from("staff_leave_requests")
      .select(`
        *,
        user:users!staff_leave_requests_staff_id_fkey (
            profile:user_profiles(full_name, profile_photo_url),
            staff_profile:staff_profiles(staff_code)
        )
      `)
      .eq("status", "pending")
      .in("staff_id", staffIds)
      .order("created_at", { ascending: true });

    if (reqError) {
      console.error("Error fetching pending leaves:", reqError);
      return [];
    }

    return (requests || []).map((req: any) => ({
        ...req,
        requester: {
            staff_code: req.user?.staff_profile?.staff_code || 'N/A',
            user: {
                profile: req.user?.profile || { full_name: 'Unknown Staff', profile_photo_url: null }
            }
        }
    }));
  },

  /**
   * NEW: Fetch history (Approved/Rejected) for the team
   */
  async getLeaveHistory(client: SupabaseClient, supervisorId: string) {
    // Reuse logic to find staff IDs (Simplified for brevity, ideally abstract this)
    const { data: supervisor } = await client
      .from("supervisor_profiles")
      .select("assigned_departments, assigned_wards")
      .eq("user_id", supervisorId)
      .single();

    if (!supervisor) return [];
    
    const depts = supervisor.assigned_departments || [];
    const wards = supervisor.assigned_wards || [];
    const orFilters = [];
    if (depts.length > 0) orFilters.push(`department_id.in.(${depts.join(',')})`);
    if (wards.length > 0) orFilters.push(`ward_id.in.(${wards.join(',')})`);
    
    if (orFilters.length === 0) return [];

    const { data: staffList } = await client.from("staff_profiles").select("user_id").or(orFilters.join(','));
    const staffIds = staffList?.map(s => s.user_id) || [];
    
    if (staffIds.length === 0) return [];

    // Fetch Non-Pending Requests
    const { data: requests } = await client
      .from("staff_leave_requests")
      .select(`
        *,
        user:users!staff_leave_requests_staff_id_fkey (
            profile:user_profiles(full_name, profile_photo_url),
            staff_profile:staff_profiles(staff_code)
        )
      `)
      .in("staff_id", staffIds)
      .neq("status", "pending") // Not pending
      .order("created_at", { ascending: false }) // Newest first
      .limit(50);

    return (requests || []).map((req: any) => ({
        ...req,
        requester: {
            staff_code: req.user?.staff_profile?.staff_code || 'N/A',
            user: {
                profile: req.user?.profile || { full_name: 'Unknown Staff', profile_photo_url: null }
            }
        }
    }));
  },

  // ... existing processRequest ...
  async processRequest(client: SupabaseClient, requestId: string, adminId: string, status: 'approved' | 'rejected', reason?: string) {
    const { data: request, error: updateError } = await client
      .from("staff_leave_requests")
      .update({
        status: status,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq("id", requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (status === 'approved') {
      const colMap: Record<string, string> = { 'sick': 'sick_used', 'casual': 'casual_used', 'annual': 'annual_used' };
      const column = colMap[request.leave_type];
      if (column) {
        await client.rpc('increment_leave_balance', { p_staff_id: request.staff_id, p_column: column, p_days: request.total_days });
      }
    }
    return request;
  }
};