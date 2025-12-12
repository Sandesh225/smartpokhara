"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUpRight } from "lucide-react";

import { PriorityChangeModal } from "@/components/supervisor/modals/PriorityChangeModal";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PriorityIndicator } from "../shared/PriorityIndicator";

interface PriorityPanelProps {
  complaintId: string;
  currentPriority: string;
}

export function PriorityPanel({ complaintId, currentPriority }: PriorityPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePriority = async (newPriority: string, reason: string) => {
    try {
      await supervisorComplaintsQueries.updateComplaintPriority(supabase, complaintId, newPriority, reason);
      toast.success("Priority updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update priority");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Priority & Escalation</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Current Level</span>
          <PriorityIndicator priority={currentPriority} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Change Priority
          </button>
          
          <button 
            onClick={() => toast.info("Open Escalation Modal")} // Wire this up later
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Escalate
          </button>
        </div>
      </div>

      <PriorityChangeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleUpdatePriority}
        currentPriority={currentPriority}
      />
    </div>
  );
}