"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  currentStatus: string;
  staffId: string;
}

export function StatusToggle({ currentStatus, staffId }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleUpdate = async (newStatus: string) => {
    if (loading || status === newStatus) return;
    setLoading(true);
    setStatus(newStatus); // Optimistic update
    
    try {
      const { error } = await supabase
        .from("staff_profiles")
        .update({ availability_status: newStatus, updated_at: new Date().toISOString() })
        .eq("user_id", staffId);
        
      if (error) throw error;
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error(err);
      setStatus(status); // Revert
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
      {['available', 'busy', 'on_break', 'off_duty'].map((s) => {
        const labels: Record<string, string> = { available: "Active", busy: "Busy", on_break: "Break", off_duty: "Off" };
        const isActive = status === s;
        
        return (
          <button
            key={s}
            onClick={() => handleUpdate(s)}
            disabled={loading}
            className={cn(
              "flex-1 px-2 py-1.5 text-xs font-medium rounded-md capitalize transition-all duration-200",
              isActive 
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5 font-bold" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            {labels[s]}
          </button>
        );
      })}
    </div>
  );
}