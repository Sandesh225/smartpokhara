"use client";

import { Complaint } from "@/features/complaints";
import { UniversalComplaintsTable } from "@/components/complaints/shared/UniversalComplaintsTable";
import { ComplaintActionType, PortalMode } from "@/types/complaints-ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ComplaintsTableProps {
  data: Complaint[];
  loading: boolean;
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  portalMode?: PortalMode;
}

export function ComplaintsTable({
  data,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  pagination,
  portalMode = "ADMIN",
}: ComplaintsTableProps) {
  const router = useRouter();

  const handleAction = (action: ComplaintActionType, complaint: Complaint) => {
    switch (action) {
      case "ASSIGN":
        // In a real app, this would likely open a modal.
        // For now, we'll navigate to the details page where assignment usually happens,
        // or trigger a toast if it's a placeholder.
        router.push(`/${portalMode.toLowerCase()}/complaints/${complaint.id}`);
        break;
      case "DELETE":
        if (confirm("Are you sure you want to mark this as spam?")) {
           toast.success("Complaint marked as spam (simulation)");
           // Trigger actual delete logic here if passed from parent
        }
        break;
      default:
        break;
    }
  };

  return (
    <UniversalComplaintsTable
      data={data}
      isLoading={loading}
      portalMode={portalMode}
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      pagination={pagination}
      onAction={handleAction}
    />
  );
}