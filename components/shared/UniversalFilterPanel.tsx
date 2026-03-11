"use client";

import { useState } from "react";
import { X, Filter, Search, Calendar, ChevronDown, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type FilterType = "text" | "select" | "date" | "multi-select";
export type FilterLayout = "sidebar" | "bar";

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

interface UniversalFilterPanelProps {
  config: FilterConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  className?: string;
  layout?: FilterLayout;
}

export function UniversalFilterPanel({
  config,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className,
  layout = "sidebar",
}: UniversalFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    config.reduce((acc, curr) => ({ ...acc, [curr.id]: true }), {})
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(activeFilters).flat().filter(Boolean).length;

  // --- RENDER: BAR LAYOUT (Admin Style) ---
  if (layout === "bar") {
    return (
      <div className={cn("w-full", className)}>
         {/* MOBILE BAR LAYOUT */}
        <div className="lg:hidden p-3 space-y-3 bg-card border border-border rounded-2xl">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder="Search..."
               value={activeFilters["search"] || ""}
               onChange={(e) => onFilterChange("search", e.target.value)}
               className="pl-10 h-10 bg-muted border-border focus:bg-card text-sm rounded-xl"
             />
           </div>
           
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {config.filter(c => c.id !== "search").map(field => (
                 <Select
                    key={field.id}
                    value={
                      Array.isArray(activeFilters[field.id]) 
                        ? (activeFilters[field.id][0] || "all")
                        : (activeFilters[field.id] || "all")
                    }
                    onValueChange={(val) => {
                       const value = val === "all" ? (field.type === 'multi-select' ? [] : null) : (field.type === 'multi-select' ? [val] : val);
                       onFilterChange(field.id, value);
                    }}
                 >
                    <SelectTrigger className="h-9 min-w-[110px] text-xs font-medium bg-muted border-border rounded-xl shrink-0">
                      <SelectValue placeholder={field.label} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All {field.label}</SelectItem>
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
              ))}
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9 px-3 text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              )}
           </div>
        </div>

        {/* DESKTOP BAR LAYOUT */}
        <div className="hidden lg:flex items-center gap-4 p-4 bg-card border border-border rounded-2xl">
          <div className="flex-1 max-w-md relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder={config.find(c => c.id === "search")?.placeholder || "Search..."}
               value={activeFilters["search"] || ""}
               onChange={(e) => onFilterChange("search", e.target.value)}
               className="pl-10 h-10 bg-muted border-border focus:bg-card text-sm rounded-xl"
             />
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex items-center gap-2">
            {config.filter(c => c.id !== "search").map(field => (
                <Select
                  key={field.id}
                  value={
                    Array.isArray(activeFilters[field.id]) 
                      ? (activeFilters[field.id][0] || "all")
                      : (activeFilters[field.id] || "all")
                  }
                  onValueChange={(val) => {
                      const value = val === "all" ? (field.type === 'multi-select' ? [] : null) : (field.type === 'multi-select' ? [val] : val);
                      onFilterChange(field.id, value);
                  }}
                >
                  <SelectTrigger className="h-10 min-w-[140px] text-xs font-medium uppercase tracking-wider bg-muted border-border rounded-xl">
                    <SelectValue placeholder={field.label} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[300px]">
                    <SelectItem value="all">All {field.label}</SelectItem>
                    {field.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            ))}

            {activeCount > 0 && (
              <>
                <div className="w-px h-8 bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-10 px-4 text-muted-foreground hover:text-destructive rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium uppercase tracking-wider">Reset</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: SIDEBAR LAYOUT ---
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl shadow-xs text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 bg-card shadow-2xl transform transition-transform duration-200 ease-out lg:static lg:transform-none lg:shadow-none lg:w-full lg:bg-transparent flex flex-col h-full",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header - Mobile Only */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <div className="flex items-center gap-2 text-foreground">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-medium uppercase tracking-wider text-sm">Filters</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-0 space-y-4">
          {config.map((field) => (
            <div key={field.id} className="pb-2 border-b border-border/50 last:border-0">
              <button
                onClick={() => toggleSection(field.id)}
                className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 hover:text-primary transition-colors group"
              >
                <span>{field.label}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", expandedSections[field.id] ? "rotate-180" : "")} />
              </button>

              {expandedSections[field.id] && (
                <div className="overflow-hidden animate-fade-in">
                  <div className="pt-1 pb-4">
                    {field.type === "text" && (
                      <div className="relative group">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="text"
                          value={activeFilters[field.id] || ""}
                          onChange={(e) => onFilterChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none transition-all text-foreground h-auto"
                        />
                      </div>
                    )}

                    {field.type === "multi-select" && (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                        {field.options?.map((opt) => {
                          const isChecked = (activeFilters[field.id] || []).includes(opt.value);
                          return (
                            <label key={opt.value} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-primary/5 group transition-colors">
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
                                isChecked ? "bg-primary border-primary" : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50"
                              )}>
                                {isChecked && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={4} />}
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
                              <span className={cn("text-xs font-medium flex-1", isChecked ? "text-foreground" : "text-muted-foreground")}>
                                {opt.label}
                              </span>
                              {opt.count !== undefined && (
                                <span className="text-xs font-mono opacity-50">{opt.count}</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {field.type === "date" && (
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          type="date"
                          value={activeFilters[field.id] || ""}
                          onChange={(e) => onFilterChange(field.id, e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-muted/30 border border-transparent focus:border-primary/30 rounded-xl outline-none text-foreground h-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-border">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full gap-2 border-dashed border-muted-foreground/30 text-xs font-medium uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </Button>
        </div>
      </aside>
    </>
  );
}
