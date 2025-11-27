/**
 * Extracted from dashboard-card component
 * Single responsibility: display complaint priority
 */

import { PriorityBadge } from "@/components/shared/priority-badge"

interface ComplaintPriorityBadgeProps {
  priority: "low" | "medium" | "high" | "critical"
  size?: "sm" | "md" | "lg"
}

export function ComplaintPriorityBadge({ priority, size = "md" }: ComplaintPriorityBadgeProps) {
  return <PriorityBadge priority={priority} size={size} />
}
