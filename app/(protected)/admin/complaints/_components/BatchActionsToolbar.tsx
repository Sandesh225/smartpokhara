"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  UserPlus,
  ArrowRight,
  Printer,
  Trash2,
  X,
  MoreVertical,
  Layers,
} from "lucide-react";

interface BatchActionsToolbarProps {
  selectedCount: number;
  onClear: () => void;
  onStatusChange: (status: string) => void;
}

export function BatchActionsToolbar({
  selectedCount,
  onClear,
  onStatusChange,
}: BatchActionsToolbarProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500 ease-out">
      <div className="bg-slate-900/95 text-white px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-5">
          {/* Status Badge - Left Side */}
          <div className="flex items-center gap-3 border-r border-slate-700/50 pr-5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                {selectedCount} Items
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                Batch Mode
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 h-8 px-3 rounded-lg"
              onClick={() => onStatusChange("in_progress")}
            >
              Activate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 h-8 px-3 rounded-lg"
              onClick={() => onStatusChange("resolved")}
            >
              Resolve
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-slate-800 h-8 w-8 p-0 rounded-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                className="bg-slate-900 border-slate-700 text-white min-w-[160px] rounded-xl shadow-2xl mb-2"
              >
                <DropdownMenuItem className="text-[11px] font-bold py-2.5 focus:bg-slate-800 focus:text-white cursor-pointer">
                  <UserPlus className="mr-2 h-3.5 w-3.5 text-blue-400" /> Assign
                  Personnel
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[11px] font-bold py-2.5 focus:bg-slate-800 focus:text-white cursor-pointer">
                  <Printer className="mr-2 h-3.5 w-3.5 text-slate-400" /> Print
                  Summary
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="text-[11px] font-bold py-2.5 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={onClear}
            className="ml-2 h-8 w-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}