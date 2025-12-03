// lib/api/assignments.ts
import { createClient } from "@/lib/supabase/client";

export interface AssignmentResult {
  success: boolean;
  complaint_id: string;
  staff_id: string;
  staff_name: string;
  tracking_code: string;
}

export interface StaffWorkload {
  staff_id: string;
  staff_name: string;
  staff_email: string;
  role_type: string;
  total_assigned: number;
  in_progress: number;
  pending_acceptance: number;
  completed_this_month: number;
  overdue: number;
  avg_resolution_days: number;
}

export interface UnassignedComplaint {
  id: string;
  tracking_code: string;
  title: string;
  status: string;
  priority: string;
  submitted_at: string;
  sla_due_at: string;
  is_overdue: boolean;
  category_name: string;
  ward_number: number;
}

/**
 * Assign a complaint to a staff member
 */
export async function assignComplaintToStaff(
  complaintId: string,
  staffUserId: string,
  reason?: string
): Promise<AssignmentResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("assign_complaint_to_staff", {
    p_complaint_id: complaintId,
    p_staff_user_id: staffUserId,
    p_assigned_by_user_id: user.id,
    p_reason: reason || null,
  });

  if (error) {
    console.error("Error assigning complaint:", error);
    throw new Error(error.message || "Failed to assign complaint");
  }

  return data as AssignmentResult;
}

/**
 * Staff accepts an assigned complaint
 */
export async function acceptComplaint(
  complaintId: string,
  notes?: string
): Promise<{ success: boolean; tracking_code: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("staff_accept_complaint", {
    p_complaint_id: complaintId,
    p_staff_user_id: user.id,
    p_notes: notes || null,
  });

  if (error) {
    console.error("Error accepting complaint:", error);
    throw new Error(error.message || "Failed to accept complaint");
  }

  return data;
}

/**
 * Staff rejects an assigned complaint
 */
export async function rejectComplaint(
  complaintId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();

  if (!reason || reason.trim() === "") {
    throw new Error("Rejection reason is required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("staff_reject_complaint", {
    p_complaint_id: complaintId,
    p_staff_user_id: user.id,
    p_reason: reason,
  });

  if (error) {
    console.error("Error rejecting complaint:", error);
    throw new Error(error.message || "Failed to reject complaint");
  }

  return data;
}

/**
 * Update complaint progress
 */
export async function updateComplaintProgress(
  complaintId: string,
  progressNote: string
): Promise<{ success: boolean }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("update_complaint_progress", {
    p_complaint_id: complaintId,
    p_staff_user_id: user.id,
    p_progress_note: progressNote,
  });

  if (error) {
    console.error("Error updating progress:", error);
    throw new Error(error.message || "Failed to update progress");
  }

  return data;
}

/**
 * Get staff workload statistics
 */
export async function getStaffWorkload(
  staffUserId?: string
): Promise<StaffWorkload[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_staff_workload", {
    p_staff_user_id: staffUserId || null,
  });

  if (error) {
    console.error("Error fetching staff workload:", error);
    throw new Error(error.message || "Failed to fetch workload data");
  }

  return (data || []) as StaffWorkload[];
}

/**
 * Get unassigned complaints for a department
 */
export async function getUnassignedComplaintsForDepartment(
  departmentId: string
): Promise<UnassignedComplaint[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "get_unassigned_complaints_for_department",
    {
      p_department_id: departmentId,
    }
  );

  if (error) {
    console.error("Error fetching unassigned complaints:", error);
    throw new Error(error.message || "Failed to fetch complaints");
  }

  return (data || []) as UnassignedComplaint[];
}

/**
 * Get my assigned complaints (for staff)
 */
export async function getMyAssignedComplaints(): Promise<any[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("complaints")
    .select(
      `
      id,
      tracking_code,
      title,
      description,
      status,
      priority,
      submitted_at,
      sla_due_at,
      assigned_at,
      category:complaint_categories(name),
      ward:wards(ward_number, name),
      citizen:users!complaints_citizen_id_fkey(
        email,
        user_profiles(full_name)
      )
    `
    )
    .eq("assigned_staff_id", user.id)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Error fetching assigned complaints:", error);
    throw new Error("Failed to fetch assigned complaints");
  }

  return data || [];
}