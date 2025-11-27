/**
 * Consistent status badge for complaints
 * Government-style color coding with clear semantics
 */

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
    submitted: { bg: "bg-blue-100", text: "text-blue-700", label: "Submitted" },
    received: { bg: "bg-blue-100", text: "text-blue-700", label: "Received" },
    assigned: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Assigned" },
    in_progress: { bg: "bg-amber-100", text: "text-amber-700", label: "In Progress" },
    resolved: { bg: "bg-green-100", text: "text-green-700", label: "Resolved" },
    closed: { bg: "bg-gray-100", text: "text-gray-700", label: "Closed" },
    rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
    escalated: { bg: "bg-red-100", text: "text-red-700", label: "Escalated" },
  }

  const config = statusConfig[status] || statusConfig.draft
  const sizes = {
    sm: "px-2 py-1 text-xs font-medium",
    md: "px-3 py-1.5 text-sm font-medium",
    lg: "px-4 py-2 text-base font-semibold",
  }

  return <span className={`${config.bg} ${config.text} ${sizes[size]} rounded-full inline-block`}>{config.label}</span>
}
