"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  Complaint,
  ComplaintWithRelations,
  CreateComplaintData,
  ComplaintAttachment,
  ComplaintStatusHistoryItem,
} from "@/lib/types/complaints";

/**
 * Create new complaint using the RPC `create_citizen_complaint`
 * This leverages auto-routing and SLA calculation on the backend
 */export async function createComplaint(
  complaintData: CreateComplaintData
): Promise<{
  id: string;
  tracking_code: string;
  status: string;
  submitted_at: string;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Build payload for RPC
  const payload: Record<string, unknown> = {
    category_id: complaintData.category_id,
    subcategory_id: complaintData.subcategory_id || null,
    ward_id: complaintData.ward_id,
    title: complaintData.title,
    description: complaintData.description,
    address_text: complaintData.address_text || null,
    landmark: complaintData.landmark || null,
    source: "web",
  };

  // Handle location point
  if (complaintData.location_point) {
    const { lat, lng } = complaintData.location_point;
    payload.latitude = lat;
    payload.longitude = lng;
  }

  const { data, error } = await supabase.rpc("create_citizen_complaint", {
    p_citizen_id: user.id,
    p_payload: payload,
  });

  if (error) {
    console.error("Error creating complaint via RPC:", error);
    throw new Error(`Failed to create complaint: ${error.message}`);
  }

  // Function now returns a single object (using OUT parameters), not an array
  if (!data) {
    throw new Error("No data returned from complaint creation");
  }

  return {
    id: data.id,
    tracking_code: data.tracking_code,
    status: data.status,
    submitted_at: data.submitted_at,
  };
}

/**
 * Preview auto-routing for a complaint before submission
 * Uses assignment_rules and sla_rules to predict routing
 */
export async function previewComplaintRouting(params: {
  category_id: string;
  subcategory_id?: string | null;
  ward_id: string;
}): Promise<{
  expected_department_id?: string;
  expected_department_name?: string;
  expected_priority?: string;
  expected_staff_id?: string;
  expected_staff_name?: string;
  sla_target_hours?: number;
  sla_target_days?: number;
}> {
  const supabase = createClient();

  // Find matching assignment rule
  const { data: assignmentRules } = await supabase
    .from("assignment_rules")
    .select(
      `
      *,
      department:departments(id, name),
      staff:users(id, user_profiles(full_name))
    `
    )
    .eq("is_active", true)
    .or(
      `ward_id.eq.${params.ward_id},ward_id.is.null,category_id.eq.${params.category_id},category_id.is.null,subcategory_id.eq.${params.subcategory_id || ""},subcategory_id.is.null`
    )
    .order("priority", { ascending: true })
    .limit(10);

  // Find best matching rule (most specific)
  let bestRule: any = null;
  let bestScore = -1;

  for (const rule of assignmentRules || []) {
    let score = 0;
    if (rule.subcategory_id === params.subcategory_id) score += 4;
    if (rule.category_id === params.category_id) score += 2;
    if (rule.ward_id === params.ward_id) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  // Find matching SLA rule
  const { data: slaRules } = await supabase
    .from("sla_rules")
    .select("*")
    .eq("is_active", true)
    .or(
      `category_id.eq.${params.category_id},subcategory_id.eq.${params.subcategory_id || ""}`
    )
    .order("priority", { ascending: false })
    .limit(1);

  const slaRule = slaRules?.[0];

  // Fallback to subcategory sla_days if no SLA rule
  let slaHours: number | undefined;
  if (slaRule) {
    slaHours = slaRule.target_hours;
  } else if (params.subcategory_id) {
    const { data: subcategory } = await supabase
      .from("complaint_subcategories")
      .select("sla_days")
      .eq("id", params.subcategory_id)
      .single();

    if (subcategory?.sla_days) {
      slaHours = subcategory.sla_days * 24;
    }
  }

  return {
    expected_department_id: bestRule?.default_department_id || undefined,
    expected_department_name: bestRule?.department?.name || undefined,
    expected_priority: bestRule?.default_priority || undefined,
    expected_staff_id: bestRule?.default_staff_id || undefined,
    expected_staff_name:
      bestRule?.staff?.user_profiles?.full_name || undefined,
    sla_target_hours: slaHours,
    sla_target_days: slaHours ? Math.ceil(slaHours / 24) : undefined,
  };
}

/**
 * Fetch current user's complaints with all relations
 */
export async function getUserComplaints(): Promise<ComplaintWithRelations[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      category:complaint_categories(*),
      subcategory:complaint_subcategories(*),
      ward:wards(*),
      department:departments(*),
      assigned_staff:users!complaints_assigned_staff_id_fkey(
        id,
        email,
        user_profiles(full_name)
      )
    `
    )
    .eq("citizen_id", user.id)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Error fetching complaints:", error);
    throw new Error(`Failed to fetch complaints: ${error.message}`);
  }

  return (data || []) as ComplaintWithRelations[];
}

/**
 * Fetch single complaint by ID with all relations (client-side)
 */
export async function getComplaintById(
  id: string
): Promise<ComplaintWithRelations> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      category:complaint_categories(*),
      subcategory:complaint_subcategories(*),
      ward:wards(*),
      department:departments(*),
      assigned_staff:users!complaints_assigned_staff_id_fkey(
        id,
        email,
        user_profiles(full_name)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching complaint:", error);
    throw new Error(`Failed to fetch complaint: ${error.message}`);
  }

  if (data.citizen_id !== user.id) {
    throw new Error("Unauthorized access to complaint");
  }

  return data as ComplaintWithRelations;
}

/**
 * Upload multiple files as complaint attachments
 */
export async function uploadComplaintAttachments(
  complaintId: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<{ name: string; url: string }[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const uploadedFiles: { name: string; url: string }[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.name} exceeds 10MB limit`);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
    const fileName = `${complaintId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("complaint-attachments")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("complaint-attachments").getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("complaint_attachments")
      .insert({
        complaint_id: complaintId,
        uploaded_by_user_id: user.id,
        file_name: file.name,
        file_type: fileExt,
        mime_type: file.type,
        file_size_bytes: file.size,
        file_url: publicUrl,
        storage_path: fileName,
        is_public: true,
      });

    if (insertError) throw insertError;

    uploadedFiles.push({
      name: file.name,
      url: publicUrl,
    });

    if (onProgress) {
      const progress = Math.round(((i + 1) / totalFiles) * 100);
      onProgress(progress);
    }
  }

  return uploadedFiles;
}

/**
 * Fetch attachments for a complaint
 */
export async function getComplaintAttachments(
  complaintId: string
): Promise<ComplaintAttachment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("complaint_attachments")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching attachments:", error);
    throw new Error(`Failed to fetch attachments: ${error.message}`);
  }

  return (data || []) as ComplaintAttachment[];
}

/**
 * Fetch status history for a complaint
 */
export async function getComplaintStatusHistory(
  complaintId: string
): Promise<ComplaintStatusHistoryItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("complaint_status_history")
    .select(
      `
      *,
      changed_by:users(id, email, user_profiles(full_name))
    `
    )
    .eq("complaint_id", complaintId)
    .order("changed_at", { ascending: true });

  if (error) {
    console.error("Error fetching status history:", error);
    throw new Error(`Failed to fetch status history: ${error.message}`);
  }

  return (data || []) as ComplaintStatusHistoryItem[];
}

/**
 * Submit feedback for a resolved complaint
 */
export async function submitComplaintFeedback(
  complaintId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("complaints")
    .update({
      citizen_satisfaction_rating: rating,
      citizen_feedback: feedback || null,
      feedback_submitted_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (error) {
    console.error("Error submitting feedback:", error);
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }
}