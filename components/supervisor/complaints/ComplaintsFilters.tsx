"use client";

import { useMemo } from "react";
import { FilterPanel, type FilterConfig } from "@/components/supervisor/shared/FilterPanel";

interface ComplaintsFiltersProps {
  filters: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  wards: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function ComplaintsFilters({ filters, onChange, onClear, wards, categories }: ComplaintsFiltersProps) {
  
  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      id: "search",
      label: "Search",
      type: "text",
      placeholder: "Search ID, title, or citizen...",
    },
    {
      id: "status",
      label: "Status",
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
      label: "Priority",
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
      label: "Ward",
      type: "multi-select", // CHANGED FROM 'select' TO MATCH ARRAY STATE
      options: wards.map(w => ({ label: w.name, value: w.id })),
    },
    {
      id: "category",
      label: "Category",
      type: "multi-select", // CHANGED FROM 'select' TO MATCH ARRAY STATE
      options: categories.map(c => ({ label: c.name, value: c.id })),
    },
    {
      id: "date_range",
      label: "Submitted Date",
      type: "date",
    },
  ], [wards, categories]);

  return (
    <FilterPanel
      config={filterConfig}
      activeFilters={filters}
      onFilterChange={onChange}
      onClearFilters={onClear}
      className="h-[calc(100vh-8rem)]"
    />
  );
}