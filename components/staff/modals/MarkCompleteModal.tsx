"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Upload, CheckCircle2, Loader2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
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
  staffId: staffIdProp,
  onSuccess,
}: MarkCompleteModalProps) {
  const supabase = createClient();

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(staffIdProp ?? null);

  // Auto-resolve staffId if not passed prop
  useEffect(() => {
    if (staffIdProp) {
      setResolvedStaffId(staffIdProp);
      return;
    }
    if (!isOpen) return;

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setResolvedStaffId(data.user.id);
      }
    };
    getUser();
  }, [staffIdProp, isOpen, supabase]);

  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files);
    // Limit to 5 photos max
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

  const handleSubmit = async () => {
    if (!notes.trim()) return toast.error("Please add resolution notes.");
    if (!resolvedStaffId) return toast.error("User session missing. Please refresh.");

    setIsSubmitting(true);
    try {
      const urls: string[] = [];

      // 1. Upload Photos sequentially to ensure success
      if (photos.length > 0) {
        for (const file of photos) {
          try {
            const url = await staffQueueQueries.uploadWorkPhoto(supabase, resolvedStaffId, file);
            urls.push(url);
          } catch (uploadErr) {
            console.error("Photo upload failed", uploadErr);
            toast.error(`Failed to upload ${file.name}`);
            throw new Error("Photo upload failed");
          }
        }
      }

      // 2. Complete Assignment RPC
      await staffQueueQueries.completeAssignment(supabase, assignmentId, notes.trim(), urls);

      toast.success("Task completed successfully!");
      
      // Reset state immediately
      setNotes("");
      setPhotos([]);
      
      // Close and trigger refresh
      onClose();
      onSuccess();
      
    } catch (error: any) {
      console.error("Completion failed:", error);
      
      // Handle Supabase specific errors
      const msg = error?.message || "Unknown error";
      
      if (msg.includes("row-level security")) {
         toast.error("Permission Error: You don't have access to update this task.");
      } else if (msg.includes("relation") && msg.includes("does not exist")) {
         toast.error("System Error: Database table missing. Please contact admin.");
      } else {
         toast.error(`Failed to complete task: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mark as Complete</h2>
              <p className="text-xs text-gray-500">Submit final details to close this task.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Resolution Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what work was done..."
                className="w-full min-h-[120px] p-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex justify-between">
                <span>Evidence Photos</span>
                <span className="text-xs font-normal text-gray-500">{photos.length}/5 selected</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {photos.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors">
                    <Upload className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-[10px] text-blue-600 font-medium">Add Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg flex items-start gap-3 border border-green-100">
               <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
               <div className="text-sm">
                 <p className="font-medium text-green-900">Closing this task</p>
                 <p className="text-green-700 text-xs mt-0.5">
                   The citizen and supervisor will be notified immediately.
                 </p>
               </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !notes.trim()}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Completion"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}