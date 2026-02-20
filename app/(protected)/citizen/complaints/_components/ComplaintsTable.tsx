"use client";

import { Complaint } from "@/features/complaints";
import { UniversalComplaintsTable } from "@/components/complaints/shared/UniversalComplaintsTable";
import { ComplaintActionType } from "@/types/complaints-ui";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleAction = (action: ComplaintActionType, complaint: Complaint) => {
    switch (action) {
      case "DELETE":
         // This is "Cancel Request" for citizen
        if (confirm("Are you sure you want to cancel this complaint?")) {
           toast.success("Complaint cancellation request sent.");
           // Trigger actual cancel logic
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
      portalMode="CITIZEN"
      pagination={{
        pageIndex: currentPage,
        pageSize: pageSize,
        total: total,
        onPageChange: onPageChange,
      }}
      onAction={handleAction}
    />
  );
}