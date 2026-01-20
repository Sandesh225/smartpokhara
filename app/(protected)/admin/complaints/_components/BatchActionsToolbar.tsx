"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  UserPlus,
  Printer,
  Trash2,
  X,
  MoreVertical,
  Layers,
  PlayCircle,
  ArrowRight,
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
    <>
      {/* MOBILE VERSION - Bottom Sheet Style */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-10 duration-300">
        <div className="bg-card border-t border-border shadow-2xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-black text-foreground">
                  {selectedCount} Selected
                </span>
                <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">
                  Batch Mode
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-8 w-8 text-muted-foreground hover:text-error-red"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("in_progress")}
              className="flex-col h-auto py-3 gap-1 border-info-blue/30 bg-info-blue/10 text-info-blue hover:bg-info-blue/20"
            >
              <PlayCircle className="h-5 w-5" />
              <span className="text-[10px] font-bold">Activate</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("resolved")}
              className="flex-col h-auto py-3 gap-1 border-success-green/30 bg-success-green/10 text-success-green hover:bg-success-green/20"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-[10px] font-bold">Resolve</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-col h-auto py-3 gap-1"
                >
                  <MoreVertical className="h-5 w-5" />
                  <span className="text-[10px] font-bold">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                className="w-56 rounded-xl mb-2"
              >
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest">
                  More Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs font-bold cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4 text-secondary" />
                  Assign Personnel
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-bold cursor-pointer">
                  <Printer className="mr-2 h-4 w-4 text-muted-foreground" />
                  Print Summary
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs font-bold text-error-red focus:text-error-red focus:bg-error-red/10 cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* DESKTOP VERSION - Floating Toolbar */}
      <div className="hidden lg:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
        <div className="glass px-6 py-4 rounded-2xl shadow-2xl border border-border/50 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3 border-r border-border/50 pr-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-foreground uppercase tracking-wider leading-none">
                  {selectedCount} Items
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                  Batch Mode Active
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange("in_progress")}
                className="h-9 px-4 text-xs font-black uppercase tracking-wider text-info-blue hover:bg-info-blue/10 rounded-xl"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Activate
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange("resolved")}
                className="h-9 px-4 text-xs font-black uppercase tracking-wider text-success-green hover:bg-success-green/10 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Resolve
              </Button>

              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-accent rounded-xl"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  className="w-56 rounded-xl shadow-2xl mb-2"
                >
                  <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Advanced Actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs font-bold cursor-pointer">
                    <UserPlus className="mr-2 h-4 w-4 text-secondary" />
                    Assign to Staff
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs font-bold cursor-pointer">
                    <ArrowRight className="mr-2 h-4 w-4 text-info-blue" />
                    Change Status
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs font-bold cursor-pointer">
                    <Printer className="mr-2 h-4 w-4 text-muted-foreground" />
                    Export Selection
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs font-bold text-error-red focus:text-error-red focus:bg-error-red/10 cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Dismiss Button */}
            <div className="border-l border-border/50 pl-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="h-9 w-9 text-muted-foreground hover:text-error-red hover:bg-error-red/10 rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}