"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, MoreVertical, Check, Divide } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface BatchAction {
  id: string;
  label: string;
  icon: any; // LucideIcon
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  className?: string;
  collapsed?: boolean; // If true, put in "More" menu on desktop if space is tight? Or just grouping.
}

interface UniversalBatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BatchAction[];
  className?: string;
}

export function UniversalBatchActions({
  selectedCount,
  onClearSelection,
  actions,
  className,
}: UniversalBatchActionsProps) {
  // Split actions into primary (always visible) and secondary (overflow)
  // For now, simpler logic: Show first 3-4 actions, collapse rest? 
  // Or just render all if few. Use the 'collapsed' flag.
  
  const primaryActions = actions.filter(a => !a.collapsed);
  const secondaryActions = actions.filter(a => a.collapsed);

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <>
          {/* MOBILE: Bottom Sheet / Floating Bar */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
             className={cn(
               "fixed bottom-4 left-4 right-4 z-50 lg:hidden",
               className
             )}
          >
             <div className="bg-card/95 backdrop-blur-md border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{selectedCount} Selected</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Batch Mode</span>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-8 w-8 text-muted-foreground">
                      <X className="h-4 w-4" />
                   </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                   {actions.slice(0, 2).map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={action.onClick}
                        className={cn("justify-center gap-2", action.className)}
                      >
                         <action.icon className="h-4 w-4" />
                         {action.label}
                      </Button>
                   ))}
                </div>
                {actions.length > 2 && (
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="secondary" size="sm" className="w-full">
                            More Actions <MoreVertical className="ml-2 h-4 w-4" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                         <DropdownMenuLabel>Additional Actions</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         {actions.slice(2).map(action => (
                            <DropdownMenuItem key={action.id} onClick={action.onClick} className="cursor-pointer">
                               <action.icon className="mr-2 h-4 w-4" />
                               {action.label}
                            </DropdownMenuItem>
                         ))}
                      </DropdownMenuContent>
                   </DropdownMenu>
                )}
             </div>
          </motion.div>

          {/* DESKTOP: Centered Floating Pill */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={cn(
              "hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50 items-center justify-center",
              className
            )}
          >
            <div className="glass px-2 py-2 pl-4 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-xl bg-white/80 dark:bg-black/80 flex items-center gap-4">
              {/* Counter */}
              <div className="flex items-center gap-3 border-r border-border/50 pr-4">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-lg">
                  {selectedCount}
                </span>
                <span className="text-sm font-semibold text-foreground">Selected</span>
                <button
                  onClick={onClearSelection}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {primaryActions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || "ghost"}
                    size="sm"
                    onClick={action.onClick}
                    className={cn(
                      "gap-2 h-9 px-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
                      action.className
                    )}
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}

                {/* Overflow / Secondary Actions */}
                {secondaryActions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl min-w-[180px]">
                       {secondaryActions.map(action => (
                          <DropdownMenuItem key={action.id} onClick={action.onClick} className="gap-2 font-medium cursor-pointer">
                             <action.icon className="h-4 w-4" />
                             {action.label}
                          </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
