// components/admin/complaint-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { ComplaintListItem } from "@/lib/types/complaints";

type ComplaintStatus = ComplaintListItem["status"];

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  ComplaintStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  submitted: { label: "Submitted", variant: "outline" },
  received: { label: "Received", variant: "secondary" },
  assigned: { label: "Assigned", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  resolved: { label: "Resolved", variant: "default" },
  closed: { label: "Closed", variant: "secondary" },
  rejected: { label: "Rejected", variant: "outline" },
  escalated: { label: "Escalated", variant: "destructive" },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function ComplaintStatusBadge({
  status,
  size = "md",
}: ComplaintStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" };

  return (
    <Badge variant={config.variant} className={sizeClasses[size]}>
      {config.label}
    </Badge>
  );
}