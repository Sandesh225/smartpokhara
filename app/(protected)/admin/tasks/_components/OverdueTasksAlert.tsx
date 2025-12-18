import { AlertCircle } from "lucide-react";

export function OverdueTasksAlert({ count, onViewAll }: { count: number, onViewAll: () => void }) {
  if (count === 0) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Attention Needed: {count} tasks are overdue.</span>
      </div>
      <button 
        onClick={onViewAll}
        className="text-sm font-bold hover:underline"
      >
        View All
      </button>
    </div>
  );
}