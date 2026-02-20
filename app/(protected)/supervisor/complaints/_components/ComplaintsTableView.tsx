"use client";

import { memo } from "react";
import { Complaint } from "@/features/complaints";
import { UniversalComplaintsTable } from "@/components/complaints/shared/UniversalComplaintsTable";
import { ComplaintActionType } from "@/types/complaints-ui";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ComplaintsTableViewProps {
  complaints: Complaint[];
  selectedIds: string[];
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  isLoading: boolean;
}

export const ComplaintsTableView = memo(function ComplaintsTableView({
  complaints,
  selectedIds,
  onSelect,
  onSelectAll,
  isLoading,
}: ComplaintsTableViewProps) {
  const router = useRouter();

  const handleAction = (action: ComplaintActionType, complaint: Complaint) => {
    switch (action) {
      case "ASSIGN":
      case "ESCALATE":
         // For supervisor, these likely have quick-actions or modals
         toast.info("Opening tactical options for " + action);
         break;
      case "RESOLVE":
         if(confirm("Confirm resolution of protocol?")) {
            toast.success("Protocol resolved successfully.");
         }
         break;
      default:
         break;
    }
  };

  return (
    <UniversalComplaintsTable
      data={complaints}
      isLoading={isLoading}
      portalMode="SUPERVISOR"
      variant="tactical" // THE KEY: Activates the glass/tech UI
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onAction={handleAction}
    />
  );
});
