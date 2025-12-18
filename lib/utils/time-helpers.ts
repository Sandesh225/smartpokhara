import { formatDistanceToNow, isPast, isValid } from "date-fns";

export function getTimeRemaining(dateString: string) {
  if (!dateString) return "No due date";
  const d = new Date(dateString);
  if (!isValid(d)) return "Invalid date";
  
  if (isPast(d)) return `Overdue by ${formatDistanceToNow(d)}`;
  return `${formatDistanceToNow(d)} left`;
}

export function isOverdue(dateString: string) {
  if (!dateString) return false;
  return isPast(new Date(dateString));
}