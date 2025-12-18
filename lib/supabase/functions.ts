import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calls the `rpc_get_supervisor_dashboard_v2` function
 */
export const fetchDashboardMetrics = async (supabase: SupabaseClient, supervisorId: string) => {
  const { data, error } = await supabase.rpc('rpc_get_supervisor_dashboard_v2', {
    p_supervisor_id: supervisorId,
  });
  
  if (error) throw error;
  return data;
};

/**
 * Calls the `rpc_get_assignable_staff` function
 * Smart recommendation engine based on workload and location
 */
export const getAssignableStaff = async (
  supabase: SupabaseClient, 
  supervisorId: string, 
  complaintLat?: number, 
  complaintLng?: number
) => {
  const location = (complaintLat && complaintLng) 
    ? `POINT(${complaintLng} ${complaintLat})` 
    : null;

  const { data, error } = await supabase.rpc('rpc_get_assignable_staff', {
    p_supervisor_id: supervisorId,
    p_complaint_location: location
  });

  if (error) throw error;
  return data;
};

export const autoAssignComplaint = async (supabase: SupabaseClient, complaintId: string) => {
  // Assumes a corresponding PG function exists or logic is handled here via multiple calls
  // For this example, we'll assume a direct RPC call
  const { data, error } = await supabase.rpc('auto_assign_complaint', {
    p_complaint_id: complaintId
  });
  if (error) throw error;
  return data;
};