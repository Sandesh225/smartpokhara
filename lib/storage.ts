"use client";

import { createClient } from "@/lib/supabase/client";

type UploadFileArgs = {
  bucket: string;
  file: File;
  path?: string; // Optional explicit path
};

type UploadFileResult = {
  path: string;
};

/**
 * Generic upload helper for any Supabase Storage bucket
 */
export async function uploadFile({
  bucket,
  file,
  path,
}: UploadFileArgs): Promise<UploadFileResult> {
  const supabase = createClient();

  const ext = file.name.split(".").pop() || "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const finalPath =
    path ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext.toLowerCase()}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(finalPath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(error.message);
  }

  return { path: data.path };
}

/**
 * Map MIME type -> complaint_attachment_type enum
 * (photo | video | audio | document)
 */
function detectComplaintAttachmentType(
  mimeType: string
): "photo" | "video" | "audio" | "document" {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export type UploadComplaintAttachmentResult = {
  attachmentId: string;
  storagePath: string;
  fileType: "photo" | "video" | "audio" | "document";
};

/**
 * Upload a single attachment for a complaint.
 * - Uploads file to `complaint-attachments` bucket (PRIVATE)
 * - Calls `rpc_upload_complaint_attachment` to insert DB record
 */
export async function uploadComplaintAttachment(args: {
  complaintId: string;
  file: File;
  uploadContext?: string; // e.g. "initial_submission", "work_progress"
}): Promise<UploadComplaintAttachmentResult> {
  const supabase = createClient();
  const { complaintId, file, uploadContext = "initial_submission" } = args;

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`${file.name} exceeds 10MB limit`);
  }

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 180);

  const storagePath = `complaints/${complaintId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  // 1) Upload to private bucket
  const { error: uploadError } = await supabase.storage
    .from("complaint-attachments")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading complaint attachment:", uploadError);
    throw new Error(uploadError.message);
  }

  const fileTypeEnum = detectComplaintAttachmentType(file.type || "");

  // 2) Insert DB record via RPC (matches your SQL)
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "rpc_upload_complaint_attachment",
    {
      p_complaint_id: complaintId,
      p_file_name: sanitizedName,
      p_original_file_name: file.name,
      p_file_type: fileTypeEnum, // text -> enum cast in function
      p_mime_type: file.type || "application/octet-stream",
      p_file_size_bytes: file.size,
      p_storage_path: storagePath,
      p_storage_bucket: "complaint-attachments",
      p_file_url: null, // let function default to storage_path
      p_upload_context: uploadContext,
    }
  );

  if (rpcError) {
    console.error("rpc_upload_complaint_attachment error:", rpcError);
    // Optional: you could also delete the file from storage here to avoid orphans
    throw new Error(rpcError.message);
  }

  if (!rpcData?.success) {
    console.error("RPC returned failure:", rpcData);
    throw new Error(
      (rpcData && rpcData.error) ||
        "Failed to register attachment in database"
    );
  }

  return {
    attachmentId: rpcData.attachment_id as string,
    storagePath,
    fileType: fileTypeEnum,
  };
}

/**
 * Upload profile photo to PUBLIC `profile-photos` bucket
 * Returns public URL + path.
 */
export async function uploadProfilePhoto(
  file: File
): Promise<{ url: string; path: string }> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Auth error getting user:", authError);
  }
  if (!user) throw new Error("Not authenticated");

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Profile photo exceeds 5MB limit");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(path, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error("Profile photo upload error:", uploadError);
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-photos").getPublicUrl(path);

  return { url: publicUrl, path };
}

/**
 * Get public URL (only makes sense for PUBLIC buckets like profile-photos)
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * Delete a file from Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("Storage delete error:", error);
    throw new Error(error.message);
  }
}
