import { AlertCircle, ArrowUp, Minus } from "lucide-react";

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toLowerCase();
  if (p === "critical" || p === "urgent") {
    return <span className="flex items-center gap-1 text-red-600 font-bold text-xs"><AlertCircle className="w-3 h-3" /> Critical</span>;
  }
  if (p === "high") {
    return <span className="flex items-center gap-1 text-orange-600 font-medium text-xs"><ArrowUp className="w-3 h-3" /> High</span>;
  }
  return <span className="flex items-center gap-1 text-gray-500 text-xs"><Minus className="w-3 h-3" /> Normal</span>;
}