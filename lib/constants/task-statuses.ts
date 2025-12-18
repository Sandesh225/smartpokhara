export const TASK_STATUSES = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  AWAITING_APPROVAL: "awaiting_approval",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
  PAUSED: "paused",
} as const;

export const TASK_PRIORITIES = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];
export type TaskPriority = typeof TASK_PRIORITIES[keyof typeof TASK_PRIORITIES];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUSES.NOT_STARTED]: "Not Started",
  [TASK_STATUSES.IN_PROGRESS]: "In Progress",
  [TASK_STATUSES.AWAITING_APPROVAL]: "Awaiting Approval",
  [TASK_STATUSES.COMPLETED]: "Completed",
  [TASK_STATUSES.CANCELLED]: "Cancelled",
  [TASK_STATUSES.REJECTED]: "Rejected",
  [TASK_STATUSES.PAUSED]: "Paused",
};