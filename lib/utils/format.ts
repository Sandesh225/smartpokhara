import { formatDistanceToNow, format, isAfter, parseISO } from "date-fns"
import type { ComplaintStatus, Priority } from "@/lib/types/complaints"

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

export function formatDate(dateString: string | null, formatStr = "PPP"): string {
  if (!dateString) return "-"
  try {
    return format(parseISO(dateString), formatStr)
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-"
  try {
    return format(parseISO(dateString), "PPp")
  } catch {
    return dateString
  }
}

export function isOverdue(slaDueAt: string | null): boolean {
  if (!slaDueAt) return false
  try {
    return isAfter(new Date(), parseISO(slaDueAt))
  } catch {
    return false
  }
}

export function getStatusColor(status: ComplaintStatus): string {
  const colors: Record<ComplaintStatus, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    received: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    assigned: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    escalated: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  }
  return colors[priority] || "bg-gray-100 text-gray-800"
}

export function getStatusLabel(status: ComplaintStatus): string {
  const labels: Record<ComplaintStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    received: "Received",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    rejected: "Rejected",
    escalated: "Escalated",
  }
  return labels[status] || status
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  }
  return labels[priority] || priority
}
