"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Upload, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staffApi } from "@/features/staff";
import { motion, AnimatePresence } from "framer-motion";

interface MarkCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  staffId?: string;
  onSuccess: () => void;
}

export function MarkCompleteModal({
  isOpen,
  onClose,
  assignmentId,
  staffId: propStaffId,
  onSuccess,
}: MarkCompleteModalProps) {
  const supabase = createClient();

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(
    propStaffId ?? null
  );

  // 1. Ensure we have the staff ID for the storage folder naming
  useEffect(() => {
    if (isOpen && !resolvedStaffId) {
      const getUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          setResolvedStaffId(data.user.id);
        }
      };
      getUser();
    }
  }, [isOpen, propStaffId, resolvedStaffId, supabase]);

  // Handle Photo Previews
  const previews = useMemo(
    () => photos.map((f) => URL.createObjectURL(f)),
    [photos]
  );

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files);
    if (photos.length + newFiles.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    setPhotos((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // 2. Main Submission Logic
  const handleSubmit = async () => {
    if (!notes.trim()) return toast.error("Please add resolution notes.");
    if (!resolvedStaffId)
      return toast.error("User session missing. Please refresh.");

    setIsSubmitting(true);
    // Use an ID for the toast so we can update it (prevents toast spam)
    const toastId = "completion-process";

    try {
      const urls: string[] = [];

      // Step A: Upload Photos sequentially
      if (photos.length > 0) {
        toast.loading(`Uploading 1 of ${photos.length} photos...`, {
          id: toastId,
        });

        for (let i = 0; i < photos.length; i++) {
          toast.loading(`Uploading ${i + 1} of ${photos.length} photos...`, {
            id: toastId,
          });
          const url = await staffApi.uploadWorkPhoto(
            supabase,
            resolvedStaffId,
            photos[i]
          );
          urls.push(url);
        }
      }

      // Step B: Call RPC to update database
      toast.loading("Finalizing task details...", { id: toastId });
      await staffApi.completeAssignment(
        supabase,
        assignmentId,
        notes.trim(),
        urls
      );

      toast.success("Task marked as complete!", { id: toastId });

      // Cleanup
      setNotes("");
      setPhotos([]);
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Submission Error Details:", error);

      // Force extract message to avoid empty object {} in UI
      const errorMessage =
        error?.message ||
        error?.details ||
        "An unexpected error occurred during submission.";

      toast.error("Completion Failed", {
        id: toastId,
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Mark as Complete
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Finalize work and notify supervisor
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Resolution Notes */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                Resolution Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail the work completed, parts used, or specific findings..."
                className="w-full min-h-[140px] p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                <span>Evidence Photos</span>
                <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                  {photos.length}/5 selected
                </span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {previews.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group"
                  >
                    <img
                      src={url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {photos.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center bg-green-50 border-2 border-dashed border-green-200 rounded-xl cursor-pointer hover:bg-green-100 hover:border-green-300 transition-all group">
                    <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-[10px] text-green-700 font-bold mt-2 uppercase tracking-wider">
                      Add Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3 border border-blue-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-blue-900">Task Completion</p>
                <p className="text-blue-700/80 text-xs mt-0.5 leading-relaxed">
                  Once submitted, the complaint status will be set to
                  "Resolved". The citizen will be notified to provide feedback.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !notes.trim()}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-base shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing
                  Submission...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Confirm & Complete Task
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}