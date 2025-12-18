import { SupabaseClient } from '@supabase/supabase-js';
// Note: Actual PDF generation happens on Client or Edge Function, not here.
// This helper manages the database records for reports.

export const formatReportData = (data: any[]) => {
  // Transform raw DB data into CSV/Excel friendly format
  return data.map(item => ({
    ID: item.tracking_code,
    Status: item.status,
    Date: new Date(item.submitted_at).toLocaleDateString(),
    Category: item.category,
    Staff: item.assigned_staff?.full_name || 'Unassigned'
  }));
};

export const createReportRecord = async (supabase: SupabaseClient, payload: any) => {
  return await supabase
    .from('generated_reports')
    .insert(payload)
    .select()
    .single();
};