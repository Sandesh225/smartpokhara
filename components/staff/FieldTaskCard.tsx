// components/staff/FieldTaskCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type Task = Database['public']['Tables']['tasks']['Row'] & {
  related_complaint?: { 
    tracking_code: string; 
    title: string;
    location_point?: any;
    address_text?: string;
  };
  wards?: { ward_number: number; name: string };
};

interface FieldTaskCardProps {
  task: Task;
  onStatusUpdate: () => void;
}

export function FieldTaskCard({ task, onStatusUpdate }: FieldTaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const updateTaskStatus = async (newStatus: string) => {
    setIsUpdating(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", task.id);

      if (error) throw error;
      
      // If marking as completed, show photo upload
      if (newStatus === "completed") {
        setShowPhotoUpload(true);
      } else {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    const supabase = createClient();
    
    try {
      // Upload file to storage
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${task.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('complaint-attachments')
        .upload(`task-photos/${fileName}`, photoFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(`task-photos/${fileName}`);

      // Create attachment record
      const { error: attachmentError } = await supabase
        .from("complaint_attachments")
        .insert({
          complaint_id: task.related_complaint_id,
          uploaded_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          file_name: photoFile.name,
          file_type: photoFile.type,
          file_size_bytes: photoFile.size,
          file_url: publicUrl,
          storage_path: `task-photos/${fileName}`,
          is_public: true
        });

      if (attachmentError) throw attachmentError;

      setShowPhotoUpload(false);
      setPhotoFile(null);
      onStatusUpdate();
      
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const openInMaps = () => {
    if (task.related_complaint?.location_point) {
      const [lng, lat] = task.related_complaint.location_point.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else if (task.related_complaint?.address_text) {
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(task.related_complaint.address_text)}`, '_blank');
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 text-sm">
        {task.related_complaint && (
          <div>
            <span className="font-medium">Related Complaint:</span>
            <Link 
              href={`/staff/complaints/${task.related_complaint_id}`}
              className="ml-1 text-blue-600 hover:text-blue-500"
            >
              {task.related_complaint.tracking_code}
            </Link>
          </div>
        )}
        <div>
          <span className="font-medium">Ward:</span>
          <span className="ml-1 text-gray-600">{task.wards?.name || "N/A"}</span>
        </div>
        <div>
          <span className="font-medium">Due Date:</span>
          <span className="ml-1 text-gray-600">
            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
          </span>
        </div>
        <div>
          <span className="font-medium">Priority:</span>
          <span className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            task.priority === 'critical' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        {/* Location Button */}
        {(task.related_complaint?.location_point || task.related_complaint?.address_text) && (
          <button
            onClick={openInMaps}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Open in Maps
          </button>
        )}

        {/* Status Update Buttons */}
        {task.status === "open" && (
          <button
            onClick={() => updateTaskStatus("in_progress")}
            disabled={isUpdating}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Start Work"}
          </button>
        )}

        {task.status === "in_progress" && (
          <button
            onClick={() => updateTaskStatus("completed")}
            disabled={isUpdating}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Mark Complete"}
          </button>
        )}

        {/* Photo Upload for Completed Tasks */}
        {showPhotoUpload && (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePhotoUpload}
                disabled={!photoFile}
                className="flex-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Upload Photo
              </button>
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* View Details */}
        <Link
          href={`/staff/tasks/${task.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}