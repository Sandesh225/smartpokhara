"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ComplaintAttachment } from "@/features/complaints";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Eye,
  Loader2,
} from "lucide-react";

interface ComplaintAttachmentsProps {
  complaintId: string;
  attachments: ComplaintAttachment[];
  canUpload?: boolean;
}

export function ComplaintAttachments({
  complaintId,
  attachments,
  canUpload = false,
}: ComplaintAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const toastId = toast.loading(`Uploading ${file.name}...`);

      const fileExt = file.name.split(".").pop();
      const fileName = `${complaintId}/${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("complaint-attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("complaint-attachments")
        .getPublicUrl(fileName);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from("complaint_attachments")
        .insert({
          complaint_id: complaintId,
          uploaded_by_user_id: user?.id!,
          file_name: file.name,
          file_type: fileExt,
          mime_type: file.type,
          file_size_bytes: file.size,
          file_url: urlData.publicUrl,
          storage_path: fileName,
          is_public: true,
        });

      if (insertError) throw insertError;

      toast.dismiss(toastId);
      toast.success("File uploaded successfully");

      window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="relative group">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept="image/*,.pdf"
          />

          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group"
          >
            <div className="h-16 w-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-white" />
              )}
            </div>

            <p className="text-base font-semibold text-slate-700 mb-1">
              {uploading ? "Uploading..." : "Upload Attachment"}
            </p>

            <p className="text-sm text-slate-500">
              Images and PDF files • Max 10MB
            </p>
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((attachment, index) => (
          <AttachmentCard
            key={attachment.id}
            attachment={attachment}
            formatFileSize={formatFileSize}
            index={index}
          />
        ))}
      </div>

      {attachments.length === 0 && !canUpload && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No attachments</p>
          <p className="text-sm text-slate-400 mt-1">
            No files have been uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}

function AttachmentCard({
  attachment,
  formatFileSize,
  index,
}: {
  attachment: ComplaintAttachment;
  formatFileSize: (bytes: number | null) => string;
  index: number;
}) {
  const isImage =
    attachment.file_type?.includes("image") ||
    attachment.mime_type?.includes("image");

  return (
    <div
      className="glass rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all duration-300 group animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
            isImage
              ? "bg-linear-to-br from-blue-500 to-cyan-500"
              : "bg-linear-to-br from-red-500 to-pink-500"
          }`}
        >
          {isImage ? (
            <ImageIcon className="w-6 h-6 text-white" />
          ) : (
            <FileText className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {attachment.file_name}
          </p>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>{formatFileSize(attachment.file_size_bytes)}</span>
            <span>•</span>
            <span>{new Date(attachment.uploaded_at).toLocaleDateString()}</span>
          </div>
        </div>

        <a
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </a>
      </div>
    </div>
  );
}
