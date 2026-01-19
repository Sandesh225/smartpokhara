"use client";

import { useState } from "react";
import { X, Lock, Users, ShieldAlert } from "lucide-react";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    text: string,
    tags: string[],
    visibility: string
  ) => Promise<void>;
}

export function AddNoteModal({
  isOpen,
  onClose,
  onConfirm,
}: AddNoteModalProps) {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("internal_only");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    await onConfirm(text, [], visibility);
    setIsSubmitting(false);
    setText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-midnight/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="stone-card dark:stone-card-elevated w-full max-w-lg overflow-hidden shadow-2xl scale-in-center border-none">
        {/* Header */}
        <div className="p-6 bg-primary/5 border-b border-primary/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              Internal Documentation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Protocol Entry
            </label>
            <textarea
              className="w-full bg-muted/30 border border-primary/10 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none min-h-[160px] transition-all"
              placeholder="Enter detailed observations for the internal record..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Access Permissions
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setVisibility("internal_only")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  visibility === "internal_only"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent opacity-60 grayscale hover:grayscale-0"
                )}
              >
                <Lock
                  className={cn(
                    "h-5 w-5",
                    visibility === "internal_only"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-[11px] font-black uppercase tracking-tighter">
                  Private Note
                </span>
              </button>

              <button
                onClick={() => setVisibility("admin_shared")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  visibility === "admin_shared"
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-border bg-transparent opacity-60 grayscale hover:grayscale-0"
                )}
              >
                <Users
                  className={cn(
                    "h-5 w-5",
                    visibility === "admin_shared"
                      ? "text-blue-500"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-[11px] font-black uppercase tracking-tighter">
                  Shared Entry
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-muted/20 border-t border-primary/10 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest"
          >
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim()}
            className="bg-primary text-white text-xs font-black uppercase tracking-widest px-8 shadow-lg accent-glow h-11"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              "Authorize Entry"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}