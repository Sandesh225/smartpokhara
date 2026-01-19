"use client";

import { useMemo } from "react";
import { FilterPanel, type FilterConfig } from "@/components/supervisor/shared/FilterPanel";
import { cn } from "@/lib/utils";

interface ComplaintsFiltersProps {
  filters: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  wards: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  className?: string;
}

export function ComplaintsFilters({
  filters,
  onChange,
  onClear,
  wards,
  categories,
  className,
}: ComplaintsFiltersProps) {
  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        id: "search",
        label: "Reference Search",
        type: "text",
        placeholder: "ID, title, or citizen...",
      },
      {
        id: "status",
        label: "Current Status",
        type: "multi-select",
        options: [
          { label: "Received", value: "received" },
          { label: "Assigned", value: "assigned" },
          { label: "In Progress", value: "in_progress" },
          { label: "Resolved", value: "resolved" },
          { label: "Escalated", value: "escalated" },
          { label: "Closed", value: "closed" },
        ],
      },
      {
        id: "priority",
        label: "Urgency Level",
        type: "multi-select",
        options: [
          { label: "Critical", value: "critical" },
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
        ],
      },
      {
        id: "ward_id",
        label: "Geographic Ward",
        type: "multi-select",
        options: wards.map((w) => ({ label: `Ward ${w.name}`, value: w.id })),
      },
      {
        id: "category",
        label: "Department Category",
        type: "multi-select",
        options: categories.map((c) => ({ label: c.name, value: c.id })),
      },
      {
        id: "date_range",
        label: "Submission Window",
        type: "date",
      },
    ],
    [wards, categories]
  );

  return (
    <div className={cn("flex flex-col h-full gap-4", className)}>
      <div className="space-y-1 px-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 dark:text-dark-text-tertiary">
          Active Filters
        </h4>
      </div>

      <div className="stone-card p-1 dark:bg-dark-surface/50 border-none shadow-none lg:bg-transparent overflow-y-auto custom-scrollbar flex-1">
        <FilterPanel
          config={filterConfig}
          activeFilters={filters}
          onFilterChange={onChange}
          onClearFilters={onClear}
          className="pr-2 transition-colors-smooth"
        />
      </div>

      {/* Machhapuchhre Modern Glass Footer */}
      <div className="mt-auto px-3 py-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="relative z-10 text-[10px] leading-relaxed text-muted-foreground dark:text-dark-text-secondary font-medium uppercase tracking-wider">
          <span className="font-black text-primary dark:text-glow mr-1">
            System Note:
          </span>
          Filters are scoped to your active jurisdiction protocols.
        </p>
      </div>
    </div>
  );
}