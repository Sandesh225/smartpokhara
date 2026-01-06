"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";



interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAssign: () => void;
  onPrioritize: () => void;
  onEscalate: () => void;
  onResolve: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onAssign,
  onPrioritize,
  onEscalate,
  onResolve,
}: BulkActionsBarProps) {
  // We can handle specific dialog states here if needed, or bubble up events
  
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4"
        >
          <div className="bg-white border border-gray-200 shadow-xl rounded-xl flex items-center p-2 gap-4 lg:ml-64">
            <div className="flex items-center gap-3 pl-4 border-r border-gray-200 pr-4">
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md">
                {selectedCount}
              </span>
              <span className="text-sm font-medium text-gray-600">Selected</span>
              <button
                onClick={onClearSelection}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onAssign}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Assign
              </button>
              
              <button
                onClick={onPrioritize}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Prioritize
              </button>

              <button
                onClick={onEscalate}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowUpRight className="h-4 w-4" />
                Escalate
              </button>

              <button
                onClick={onResolve}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolve
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}