"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { complaintsApi } from "@/features/complaints";
import { PriorityChangeModal } from "@/components/supervisor/modals/PriorityChangeModal";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriorityIndicator } from "@/components/shared";

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
      await complaintsApi.updateComplaintPriority(
        supabase,
        complaintId,
        newPriority,
        reason
      );
      toast.success("Priority updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update priority");
    }
  };

  const isUrgent = ["high", "urgent", "critical"].includes(currentPriority.toLowerCase());

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-foreground/70" />
            Urgency & SLA
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Level</span>
            <PriorityIndicator priority={currentPriority} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-9 w-full text-xs font-semibold"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-2" />
              Change
            </Button>
            
            <Button
              size="sm"
              onClick={() => toast.info("Escalation flow triggered")} // Placeholder for future feature
              className="h-9 w-full text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-2" />
              Escalate
            </Button>
          </div>

          {isUrgent && (
            <div className="text-sm text-orange-700 bg-orange-50 p-2.5 rounded border border-orange-100 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="leading-tight">
                High priority complaints require daily status updates per department policy.
              </p>
            </div>
          )}
        </div>
      </div>

      <PriorityChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleUpdatePriority}
        currentPriority={currentPriority}
      />
    </>
  );
}