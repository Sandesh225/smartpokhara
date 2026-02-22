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
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
        <h3 className="text-base font-semibold text-foreground">Checklist</h3>
        <span className="text-xs font-medium text-muted-foreground">{progress}% Complete</span>
      </div>
      
      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-success-green transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="divide-y divide-border/50">
        {localItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => toggleItem(item.id, item.is_completed)}
            className="flex items-start gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
          >
            <div className={cn("mt-0.5", item.is_completed ? "text-success-green" : "text-muted-foreground")}>
              {item.is_completed ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
            </div>
            <span className={cn("text-sm text-foreground", item.is_completed && "line-through text-muted-foreground")}>
              {item.description}
            </span>
          </div>
        ))}
        {localItems.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No checklist items.</p>}
      </div>
    </div>
  );
}