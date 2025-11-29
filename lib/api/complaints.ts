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
 * Also enforces that the complaint belongs to the current user.
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
 * Create new complaint with optional file attachments metadata
 */
export async function createComplaint(
  complaintData: CreateComplaintData
): Promise<Complaint> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const insertData: Record<string, unknown> = {
    citizen_id: user.id,
    category_id: complaintData.category_id,
    subcategory_id: complaintData.subcategory_id || null,
    ward_id: complaintData.ward_id,
    title: complaintData.title,
    description: complaintData.description,
    address_text: complaintData.address_text || null,
    landmark: complaintData.landmark || null,
    status: "submitted",
    source: "web",
    submitted_at: new Date().toISOString(),
  };

  if (complaintData.location_point) {
    const { lat, lng } = complaintData.location_point;
    insertData.location_point = `POINT(${lng} ${lat})`;
  }

  const { data, error } = await supabase
    .from("complaints")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating complaint:", error);
    throw new Error(`Failed to create complaint: ${error.message}`);
  }

  return data as Complaint;
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
