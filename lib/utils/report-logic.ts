import { createClient } from "@/lib/supabase/client";
import { SupabaseClient } from '@supabase/supabase-js';

// --- Generic Report Helpers ---

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

// --- Staff/Complaint Specific Reporting ---

export async function generateStaffReport(
  staffId: string,
  startDate: Date,
  endDate: Date
) {
  const supabase = createClient();
  
  // Get complaints assigned to staff
  const { data: complaints, error: complaintsError } = await supabase
    .from("complaints")
    .select(`
      id,
      tracking_code,
      status,
      submitted_at,
      resolved_at,
      complaint_categories(name)
    `)
    .eq("assigned_staff_id", staffId)
    .gte("submitted_at", startDate.toISOString())
    .lte("submitted_at", endDate.toISOString());

  if (complaintsError) throw complaintsError;

  // Get tasks assigned to staff
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, status, created_at, due_date")
    .eq("assigned_to_user_id", staffId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (tasksError) throw tasksError;

  // Calculate metrics
  const totalComplaints = complaints?.length || 0;
  const resolvedComplaints = complaints?.filter(c => c.status === "resolved").length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;

  // Calculate average resolution time
  const resolvedWithTime = complaints?.filter(c => c.resolved_at) || [];
  const totalResolutionTime = resolvedWithTime.reduce((acc, complaint) => {
    const submitted = new Date(complaint.submitted_at);
    const resolved = new Date(complaint.resolved_at!);
    return acc + (resolved.getTime() - submitted.getTime());
  }, 0);
  const avgResolutionDays = resolvedWithTime.length > 0
    ? totalResolutionTime / resolvedWithTime.length / (1000 * 60 * 60 * 24)
    : 0;

  return {
    totalComplaints,
    resolvedComplaints,
    resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
    avgResolutionDays,
    totalTasks,
    completedTasks,
    taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    complaints,
    tasks
  };
}

export async function exportComplaintsToCSV(filters: any) {
  const supabase = createClient();
  
  let query = supabase
    .from("complaints")
    .select(`
      tracking_code,
      title,
      status,
      priority,
      submitted_at,
      resolved_at,
      user_profiles(full_name, phone),
      complaint_categories(name),
      wards(ward_number, name)
    `)
    .order("submitted_at", { ascending: false });

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.startDate) {
    query = query.gte("submitted_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("submitted_at", filters.endDate);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  // Convert to CSV
  const headers = [
    "Tracking Code",
    "Title",
    "Status",
    "Priority",
    "Submitted Date",
    "Resolved Date",
    "Citizen Name",
    "Citizen Phone",
    "Category",
    "Ward"
  ];

  const rows = (data as any[])?.map((complaint: any) => [
    complaint.tracking_code,
    complaint.title,
    complaint.status,
    complaint.priority,
    new Date(complaint.submitted_at).toLocaleDateString(),
    complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : "",
    Array.isArray(complaint.user_profiles) ? complaint.user_profiles[0]?.full_name : complaint.user_profiles?.full_name || "",
    Array.isArray(complaint.user_profiles) ? complaint.user_profiles[0]?.phone : complaint.user_profiles?.phone || "",
    Array.isArray(complaint.complaint_categories) ? complaint.complaint_categories[0]?.name : complaint.complaint_categories?.name || "",
    Array.isArray(complaint.wards) ? `Ward ${complaint.wards[0]?.ward_number}` : (complaint.wards ? `Ward ${complaint.wards.ward_number}` : "")
  ]) || [];

  const csv = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  return csv;
}
