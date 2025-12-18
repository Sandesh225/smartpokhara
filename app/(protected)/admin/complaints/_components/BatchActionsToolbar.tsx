"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { CheckSquare, UserPlus, ArrowRight, Printer, Trash2, X, MoreVertical } from "lucide-react";

interface BatchActionsToolbarProps {
  selectedCount: number;
  onClear: () => void;
  onStatusChange: (status: string) => void;
}

export function BatchActionsToolbar({ selectedCount, onClear, onStatusChange }: BatchActionsToolbarProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          {/* Selection Count */}
          <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold">{selectedCount} Selected</div>
              <div className="text-xs text-slate-400">Bulk actions available</div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-slate-800 hover:text-white transition-colors h-9 px-4"
              onClick={() => onStatusChange("in_progress")}
            >
              Set In Progress
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-slate-800 hover:text-white transition-colors h-9 px-4"
              onClick={() => onStatusChange("resolved")}
            >
              Set Resolved
            </Button>
            
            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-slate-800 hover:text-white transition-colors h-9 px-3"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-slate-800 border-slate-700 text-white w-48">
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer focus:text-white">
                  <UserPlus className="mr-2 h-4 w-4" /> 
                  Assign Staff
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer focus:text-white">
                  <Printer className="mr-2 h-4 w-4" /> 
                  Print Report
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="hover:bg-red-900/50 focus:bg-red-900/50 cursor-pointer text-red-400 focus:text-red-400">
                  <Trash2 className="mr-2 h-4 w-4" /> 
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClear} 
            className="ml-4 text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            aria-label="Clear selection"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}