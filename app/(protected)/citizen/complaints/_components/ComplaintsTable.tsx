"use client";

import { Complaint } from "@/features/complaints";
import { UniversalComplaintsTable } from "@/components/complaints/shared/UniversalComplaintsTable";
import { ComplaintActionType } from "@/types/complaints-ui";
import { toast } from "sonner";

interface ComplaintsTableProps {
  complaints: Complaint[];
  total: number;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange: (column: string, order: "ASC" | "DESC") => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  onRowClick?: (complaint: Complaint) => void;
  basePath?: string;
}

export function ComplaintsTable({
  complaints,
  total,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onSortChange,
}: ComplaintsTableProps) {

  const handleAction = (action: ComplaintActionType, complaint: Complaint) => {
    if (action === "DELETE") {
      if (confirm("Cancel this complaint? This cannot be undone.")) {
        toast.success("Cancellation request submitted.");
        // trigger actual cancel logic here
      }
    }
  };

  return (
    <UniversalComplaintsTable
      data={complaints}
      isLoading={isLoading}
      portalMode="CITIZEN"
      pagination={{
        pageIndex: currentPage,
        pageSize,
        total,
        onPageChange,
      }}
      onAction={handleAction}
    />
  );
}