/**
 * Consistent priority badge for complaints
 * Clear visual hierarchy with government-standard colors
 */

interface PriorityBadgeProps {
  priority: string
  size?: "sm" | "md" | "lg"
}

export function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
  const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: "bg-green-100", text: "text-green-700", label: "Low" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
    high: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
    critical: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
  }

  const config = priorityConfig[priority] || priorityConfig.medium
  const sizes = {
    sm: "px-2 py-1 text-xs font-medium",
    md: "px-3 py-1.5 text-sm font-medium",
    lg: "px-4 py-2 text-base font-semibold",
  }

  return <span className={`${config.bg} ${config.text} ${sizes[size]} rounded-full inline-block`}>{config.label}</span>
}
