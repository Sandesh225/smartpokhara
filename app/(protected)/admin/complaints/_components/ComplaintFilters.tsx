"use client";

import { useMemo } from "react";
import { UniversalFilterPanel, type FilterConfig } from "@/components/shared/UniversalFilterPanel";
import { AdminComplaintFilters } from "@/features/complaints";

interface ComplaintFiltersProps {
  filters: AdminComplaintFilters;
  onFilterChange: (filters: AdminComplaintFilters) => void;
  categories?: any[];
  wards?: any[];
  onClear?: () => void;
}

export function ComplaintFilters({
  filters,
  onFilterChange,
  wards = [],
  onClear,
}: ComplaintFiltersProps) {
  if (!filters) return null;

  const updateFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key as keyof AdminComplaintFilters]: value });
  };

  const activeFilterCount = [
    filters.search,
    filters.status?.length,
    filters.priority?.length,
    filters.ward_id,
  ].filter(Boolean).length;

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        id: "search",
        label: "Search",
        type: "text",
        placeholder: "Search complaints...",
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
          { label: "Closed", value: "closed" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        id: "priority",
        label: "Priority",
        type: "multi-select",
        options: [
          { label: "Urgent", value: "urgent" },
          { label: "Critical", value: "critical" },
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
        ],
      },
      {
        id: "ward_id",
        label: "Ward",
        type: "multi-select",
        options: wards.map((w: any) => ({ label: `Ward ${w.ward_number}`, value: w.id.toString() })),
      },
    ],
    [wards]
  );

  return (
    <UniversalFilterPanel
      layout="bar"
      config={filterConfig}
      activeFilters={filters as any}
      onFilterChange={updateFilter}
      onClearFilters={onClear || (() => {})}
    />
  );
}