"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border animate-[scaleIn_0.2s_ease-out]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Change Priority</h3>
            <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" /></button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">New Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`p-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      priority === p ? 'border-primary bg-primary/10 ring-1 ring-primary text-primary' : 'border-border hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <PriorityIndicator priority={p} showLabel={false} size="sm" />
                    <span className="capitalize">{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Reason for Change</label>
              <textarea 
                className="w-full border border-input rounded-lg p-2 text-sm focus:ring-2 focus:ring-ring outline-none bg-muted text-foreground placeholder:text-muted-foreground"
                rows={3}
                placeholder="Why is the priority changing?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !reason}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="text-primary-foreground" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}