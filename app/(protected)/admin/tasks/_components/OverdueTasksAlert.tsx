// ═══════════════════════════════════════════════════════════
// OVERDUE TASKS ALERT
// ═══════════════════════════════════════════════════════════

import { AlertCircle } from "lucide-react";

export function OverdueTasksAlert({
  count,
  onViewAll,
}: {
  count: number;
  onViewAll: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="stone-card bg-error-red/10 border-error-red/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-error-red flex-shrink-0" />
        <span className="font-bold text-sm text-error-red">
          Attention: {count} {count === 1 ? "task is" : "tasks are"} overdue
        </span>
      </div>
      <button
        onClick={onViewAll}
        className="text-xs md:text-sm font-bold text-error-red hover:underline self-start sm:self-auto"
      >
        View All →
      </button>
    </div>
  );
}
