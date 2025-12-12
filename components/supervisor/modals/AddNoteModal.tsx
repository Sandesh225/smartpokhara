"use client";

import { useState } from "react";
import { X, Lock, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string, tags: string[], visibility: string) => Promise<void>;
}

export function AddNoteModal({ isOpen, onClose, onConfirm }: AddNoteModalProps) {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("internal_only");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm(text, [], visibility); // Tags logic simplified for now
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Internal Note</h3>
            <button onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
          </div>
          
          <div className="space-y-4">
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={5}
              placeholder="Type your note here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="internal_only" 
                    checked={visibility === "internal_only"}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Private (Supervisors only)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="admin_shared" 
                    checked={visibility === "admin_shared"}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Shared with Admin</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !text}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="text-white" />}
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}