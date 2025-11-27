// components/complaints/ComplaintAttachments.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface Attachment {
  id: string;
  file_name: string;
  file_type: string | null;
  file_size_bytes: number | null;
  file_url: string;
  uploaded_at: string;
  uploaded_by_user_id: string;
}

interface ComplaintAttachmentsProps {
  complaintId: string;
  attachments: Attachment[];
  canUpload?: boolean;
}

export function ComplaintAttachments({ 
  complaintId, 
  attachments, 
  canUpload = false 
}: ComplaintAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${complaintId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(fileName);

      // Insert attachment record
      const { error: insertError } = await supabase
        .from('complaint_attachments')
        .insert({
          complaint_id: complaintId,
          uploaded_by_user_id: (await supabase.auth.getUser()).data.user?.id!,
          file_name: file.name,
          file_type: fileExt,
          mime_type: file.type,
          file_size_bytes: file.size,
          file_url: urlData.publicUrl,
          storage_path: fileName,
          is_public: true,
        });

      if (insertError) throw insertError;

      // Refresh the page to show new attachment
      window.location.reload();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
            className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Attachment'}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Supports images and PDF files (max 10MB)
          </p>
        </div>
      )}

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {attachment.file_type?.includes('image') ? (
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">IMG</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-red-600 text-sm">PDF</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {attachment.file_name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(attachment.file_size_bytes)} •{' '}
                  {new Date(attachment.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <a
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View
            </a>
          </div>
        ))}

        {attachments.length === 0 && (
          <p className="text-gray-500 text-center py-4">No attachments</p>
        )}
      </div>
    </div>
  );
}