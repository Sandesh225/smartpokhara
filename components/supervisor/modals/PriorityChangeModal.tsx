"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";
import { PriorityIndicator } from "@/components/supervisor/shared/PriorityIndicator";

interface PriorityChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (priority: string, reason: string) => Promise<void>;
  currentPriority: string;
}

export function PriorityChangeModal({ isOpen, onClose, onConfirm, currentPriority }: PriorityChangeModalProps) {
  const [priority, setPriority] = useState(currentPriority);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm(priority, reason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Change Priority</h3>
            <button onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`p-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 ${
                      priority === p ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <PriorityIndicator priority={p} showLabel={false} size="sm" />
                    <span className="capitalize">{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Change</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                placeholder="Why is the priority changing?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !reason}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="text-white" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}