"use client";

import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { tasksApi } from "@/features/tasks/api";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  description: string;
  is_completed: boolean;
}

export function TaskChecklist({ items }: { items: ChecklistItem[] }) {
  const [localItems, setLocalItems] = useState(items);
  const supabase = createClient();

  const toggleItem = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, is_completed: !currentStatus } : i));
    
    try {
      await tasksApi.toggleChecklistItem(supabase, id, !currentStatus);
    } catch {
      // Revert if failed
      setLocalItems(prev => prev.map(i => i.id === id ? { ...i, is_completed: currentStatus } : i));
    }
  };

  const progress = Math.round((localItems.filter(i => i.is_completed).length / localItems.length) * 100) || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-base font-semibold text-gray-900">Checklist</h3>
        <span className="text-xs font-medium text-gray-500">{progress}% Complete</span>
      </div>
      
      <div className="h-1 w-full bg-gray-100">
        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="divide-y divide-gray-50">
        {localItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => toggleItem(item.id, item.is_completed)}
            className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className={cn("mt-0.5", item.is_completed ? "text-green-600" : "text-gray-400")}>
              {item.is_completed ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
            </div>
            <span className={cn("text-sm text-gray-700", item.is_completed && "line-through text-gray-400")}>
              {item.description}
            </span>
          </div>
        ))}
        {localItems.length === 0 && <p className="p-6 text-center text-sm text-gray-400">No checklist items.</p>}
      </div>
    </div>
  );
}