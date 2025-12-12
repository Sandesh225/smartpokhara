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
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:shadow-none lg:w-64 lg:border-l lg:border-gray-200 flex flex-col h-full",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-900">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {config.map((field) => (
            <div key={field.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <button
                onClick={() => toggleSection(field.id)}
                className="flex w-full items-center justify-between text-sm font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors"
              >
                <span>{field.label}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    expandedSections[field.id] ? "rotate-180" : ""
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {expandedSections[field.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pb-2">
                      {/* Text Input */}
                      {field.type === "text" && (
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={activeFilters[field.id] || ""}
                            onChange={(e) => onFilterChange(field.id, e.target.value)}
                            placeholder={field.placeholder || "Search..."}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                          />
                        </div>
                      )}

                      {/* Select Input */}
                      {field.type === "select" && (
                        <select
                          value={activeFilters[field.id] || ""}
                          onChange={(e) => onFilterChange(field.id, e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="">All</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Date Input */}
                      {field.type === "date" && (
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="date"
                            value={activeFilters[field.id] || ""}
                            onChange={(e) => onFilterChange(field.id, e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      )}

                      {/* Multi-Select (Checkbox List) */}
                      {field.type === "multi-select" && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {field.options?.map((opt) => {
                            const isChecked = (activeFilters[field.id] || []).includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                className="flex items-start gap-2.5 cursor-pointer group"
                              >
                                <div
                                  className={cn(
                                    "mt-0.5 w-4 h-4 border rounded flex items-center justify-center transition-colors",
                                    isChecked
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300 bg-white group-hover:border-blue-400"
                                  )}
                                >
                                  {isChecked && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isChecked}
                                  onChange={() => {
                                    const current = activeFilters[field.id] || [];
                                    const next = isChecked
                                      ? current.filter((v: string) => v !== opt.value)
                                      : [...current, opt.value];
                                    onFilterChange(field.id, next);
                                  }}
                                />
                                <span className={cn(
                                  "text-sm flex-1",
                                  isChecked ? "text-gray-900 font-medium" : "text-gray-600"
                                )}>
                                  {opt.label}
                                </span>
                                {opt.count !== undefined && (
                                  <span className="text-xs text-gray-400">{opt.count}</span>
                                )}
                              </label>
                            );
                          })}
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClearFilters}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Filters
          </button>
        </div>
      </aside>
    </>
  );
}