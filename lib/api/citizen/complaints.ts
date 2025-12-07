// lib/api/complaints.ts - ENHANCED VERSION
"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  Complaint,
  ComplaintWithRelations,
  CreateComplaintData,
  ComplaintAttachment,
  ComplaintStatusHistoryItem,
  ComplaintComment,
} from "@/lib/types/complaints";

/**
 * Enhanced complaint creation with auto-routing and notifications
 */
export async function createComplaint(
  complaintData: CreateComplaintData,
  files?: File[]
): Promise<{
  id: string;
  tracking_code: string;
  status: string;
  submitted_at: string;
  attachments?: { name: string; url: string }[];
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Prepare payload for RPC
  const payload = {
    category_id: complaintData.category_id,
    subcategory_id: complaintData.subcategory_id || null,
    ward_id: complaintData.ward_id,
    title: complaintData.title,
    description: complaintData.description,
    address_text: complaintData.address_text || null,
    landmark: complaintData.landmark || null,
    source: "web",
    latitude: complaintData.location_point?.lat || null,
    longitude: complaintData.location_point?.lng || null,
  };

  // Call RPC function
  const { data, error } = await supabase.rpc("create_citizen_complaint", {
    p_citizen_id: user.id,
    p_payload: payload,
  });

  if (error) {
    console.error("Error creating complaint:", error);
    throw new Error(`Failed to create complaint: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from complaint creation");
  }

  const complaintId = data.id;

  // Upload attachments if any
  let uploadedAttachments: { name: string; url: string }[] = [];
  if (files && files.length > 0) {
    uploadedAttachments = await uploadComplaintAttachments(complaintId, files);
  }

  // Trigger notification
  await triggerComplaintNotification(complaintId);

  return {
    id: complaintId,
    tracking_code: data.tracking_code,
    status: data.status,
    submitted_at: data.submitted_at,
    attachments: uploadedAttachments,
  };
}

/**
 * Upload attachments with progress tracking
 */
export async function uploadComplaintAttachments(
  complaintId: string,
  files: File[],
  onProgress?: (progress: number, fileIndex: number) => void
): Promise<{ name: string; url: string }[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const uploadedFiles: { name: string; url: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.name} exceeds 10MB limit`);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const fileName = `${complaintId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("complaint-attachments")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("complaint-attachments")
      .getPublicUrl(fileName);

    // Insert attachment record
    const { error: insertError } = await supabase
      .from("complaint_attachments")
      .insert({
        complaint_id: complaintId,
        uploaded_by_user_id: user.id,
        file_name: file.name,
        original_file_name: file.name,
        file_type: getFileType(file.type),
        mime_type: file.type,
        file_size_bytes: file.size,
        storage_path: fileName,
        file_url: publicUrl,
        is_public: true,
        uploaded_by_role: "citizen",
      });

    if (insertError) throw insertError;

    uploadedFiles.push({
      name: file.name,
      url: publicUrl,
    });

    // Report progress
    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 100), i);
    }
  }

  return uploadedFiles;
}

function getFileType(mimeType: string): "photo" | "video" | "document" | "audio" {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

/**
 * Trigger notification for new complaint
 */
async function triggerComplaintNotification(complaintId: string): Promise<void> {
  const supabase = createClient();
  
  try {
    // Call edge function to send notifications
    const { error } = await supabase.functions.invoke("send-notification", {
      body: {
        type: "new_complaint",
        complaint_id: complaintId,
        priority: "high",
      },
    });

    if (error) {
      console.warn("Failed to send notification:", error);
    }
  } catch (error) {
    console.warn("Notification trigger failed:", error);
  }
}

/**
 * Real-time subscription setup
 */
export function subscribeToComplaints(
  userId: string,
  callback: (payload: any) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`complaints-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "complaints",
        filter: `citizen_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToComplaint(
  complaintId: string,
  callback: (payload: any) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
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
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "complaint_status_history",
        filter: `complaint_id=eq.${complaintId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "complaint_comments",
        filter: `complaint_id=eq.${complaintId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Add comment to complaint
 */
export async function addComment(
  complaintId: string,
  comment: string,
  isPublic: boolean = true
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("complaint_comments")
    .insert({
      complaint_id: complaintId,
      user_id: user.id,
      comment_text: comment,
      is_public: isPublic,
      user_role: "citizen",
    });

  if (error) {
    console.error("Error adding comment:", error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
}

/**
 * Get comments for complaint
 */
export async function getComments(complaintId: string): Promise<ComplaintComment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("complaint_comments")
    .select(`
      *,
      user:users(
        id,
        user_profiles(full_name, avatar_url)
      )
    `)
    .eq("complaint_id", complaintId)
    .eq("is_public", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }

  return data || [];
}

/**
 * Submit feedback for resolved complaint
 */
export async function submitFeedback(
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
      status: "closed", // Auto-close after feedback
    })
    .eq("id", complaintId);

  if (error) {
    console.error("Error submitting feedback:", error);
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }

  // Record feedback in separate table
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("complaint_citizen_feedback")
      .insert({
        complaint_id: complaintId,
        user_id: user.id,
        rating,
        feedback_text: feedback,
        submitted_at: new Date().toISOString(),
      });
  }
}

/**
 * Share complaint link
 */
export function generateShareLink(complaintId: string, trackingCode: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || '';
  return `${baseUrl}/public/complaints/${complaintId}?tracking=${trackingCode}`;
}

/**
 * Print complaint details
 */
export function printComplaint(complaint: ComplaintWithRelations): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Complaint: ${complaint.tracking_code}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        .header { margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #666; }
        .value { margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Complaint: ${complaint.tracking_code}</h1>
        <p>Printed on ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="section">
        <h2>Complaint Details</h2>
        <div class="value"><span class="label">Title:</span> ${complaint.title}</div>
        <div class="value"><span class="label">Status:</span> ${complaint.status}</div>
        <div class="value"><span class="label">Priority:</span> ${complaint.priority}</div>
        <div class="value"><span class="label">Submitted:</span> ${new Date(complaint.submitted_at).toLocaleString()}</div>
        <div class="value"><span class="label">Category:</span> ${complaint.category?.name || 'N/A'}</div>
        <div class="value"><span class="label">Ward:</span> Ward ${complaint.ward?.ward_number || 'N/A'}</div>
      </div>
      
      <div class="section">
        <h2>Description</h2>
        <p>${complaint.description}</p>
      </div>
      
      <div class="section">
        <h2>Location</h2>
        <div class="value"><span class="label">Address:</span> ${complaint.address_text || 'N/A'}</div>
        <div class="value"><span class="label">Landmark:</span> ${complaint.landmark || 'N/A'}</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}