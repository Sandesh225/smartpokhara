/**
 * Extracted from dashboard-card component
 * Single responsibility: display complaint status
 */

import { StatusBadge } from "@/components/shared/status-badge"

interface ComplaintStatusBadgeProps {
  status:
    | "draft"
    | "submitted"
    | "received"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "closed"
    | "rejected"
    | "escalated"
  size?: "sm" | "md" | "lg"
}

export function ComplaintStatusBadge({ status, size = "md" }: ComplaintStatusBadgeProps) {
  return <StatusBadge status={status} size={size} />
}
