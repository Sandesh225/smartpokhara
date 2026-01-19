"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, Search, Calendar, ChevronDown, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterType = "text" | "select" | "date" | "multi-select";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  config: FilterConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterPanel({
  config,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    config.reduce((acc, curr) => ({ ...acc, [curr.id]: true }), {})
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(activeFilters).flat().filter(Boolean).length;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-primary/20 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center dark:shadow-glow-sm">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-dark-surface shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:shadow-none lg:w-full lg:bg-transparent flex flex-col h-full",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header - Only visible on mobile in this implementation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-primary/10 lg:hidden">
          <div className="flex items-center gap-2 text-gray-900 dark:text-dark-text-primary">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-bold uppercase tracking-tighter text-sm">Protocol Filters</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-primary/10 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-0 space-y-4 custom-scrollbar">
          {config.map((field) => (
            <div key={field.id} className="pb-2 border-b border-gray-100 dark:border-primary/5 last:border-0">
              <button
                onClick={() => toggleSection(field.id)}
                className="flex w-full items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground dark:text-dark-text-tertiary mb-3 hover:text-primary transition-colors group"
              >
                <span>{field.label}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", expandedSections[field.id] ? "rotate-180" : "")} />
              </button>

              <AnimatePresence initial={false}>
                {expandedSections[field.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pb-4">
                      {/* Unified Input Styling for Text, Select, Date */}
                      {field.type === "text" && (
                        <div className="relative group">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <input
                            type="text"
                            value={activeFilters[field.id] || ""}
                            onChange={(e) => onFilterChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-muted/20 dark:bg-dark-surface-lighter border border-transparent focus:border-primary/30 rounded-xl outline-none transition-all dark:text-dark-text-primary"
                          />
                        </div>
                      )}

                      {field.type === "multi-select" && (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {field.options?.map((opt) => {
                            const isChecked = (activeFilters[field.id] || []).includes(opt.value);
                            return (
                              <label key={opt.value} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-primary/5 group transition-colors">
                                <div className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
                                  isChecked ? "bg-primary border-primary shadow-glow-sm" : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50"
                                )}>
                                  {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isChecked}
                                  onChange={() => {
                                    const current = activeFilters[field.id] || [];
                                    const next = isChecked ? current.filter((v: string) => v !== opt.value) : [...current, opt.value];
                                    onFilterChange(field.id, next);
                                  }}
                                />
                                <span className={cn("text-xs font-medium flex-1", isChecked ? "text-foreground dark:text-dark-text-primary" : "text-muted-foreground dark:text-dark-text-secondary")}>
                                  {opt.label}
                                </span>
                                {opt.count !== undefined && (
                                  <span className="text-[10px] font-mono opacity-50">{opt.count}</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {field.type === "date" && (
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="date"
                            value={activeFilters[field.id] || ""}
                            onChange={(e) => onFilterChange(field.id, e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-muted/20 dark:bg-dark-surface-lighter border border-transparent focus:border-primary/30 rounded-xl outline-none dark:text-dark-text-primary invert-calendar-icon"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-gray-100 dark:border-primary/10">
          <button
            onClick={onClearFilters}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/30 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Ledger Filters
          </button>
        </div>
      </aside>
    </>
  );
}