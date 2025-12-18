"use client";
import { LayoutList, LayoutGrid, Map as MapIcon, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "card" | "map" | "timeline";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: Props) {
  const options = [
    { id: "list", icon: LayoutList, label: "List" },
    { id: "card", icon: LayoutGrid, label: "Cards" },
    { id: "map", icon: MapIcon, label: "Map" },
    { id: "timeline", icon: Calendar, label: "Timeline" },
  ] as const;

  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "p-2 rounded-md transition-all",
            mode === opt.id 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
          title={opt.label}
        >
          <opt.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}