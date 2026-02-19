"use client";

import { AdminComplaintFilters } from "@/features/complaints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search, RotateCcw, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const updateFilter = (key: keyof AdminComplaintFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = [
    filters.search,
    filters.status?.length,
    filters.priority?.length,
    filters.ward_id,
  ].filter(Boolean).length;

  return (
    <div className="stone-card overflow-hidden">
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden p-3 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 h-10 bg-muted border-border focus:bg-card text-sm rounded-xl"
          />
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Status Filter */}
          <Select
            value={filters.status?.[0] || "all"}
            onValueChange={(val) =>
              updateFilter("status", val === "all" ? [] : [val])
            }
          >
            <SelectTrigger className="h-9 w-[110px] text-xs font-bold bg-muted border-border rounded-xl flex-shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="in_progress">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority?.[0] || "all"}
            onValueChange={(val) =>
              updateFilter("priority", val === "all" ? [] : [val])
            }
          >
            <SelectTrigger className="h-9 w-[110px] text-xs font-bold bg-muted border-border rounded-xl flex-shrink-0">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Ward Filter */}
          <Select
            value={filters.ward_id || "all"}
            onValueChange={(val) =>
              updateFilter("ward_id", val === "all" ? null : val)
            }
          >
            <SelectTrigger className="h-9 w-[110px] text-xs font-bold bg-muted border-border rounded-xl flex-shrink-0">
              <SelectValue placeholder="Ward" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-[300px]">
              <SelectItem value="all">All Wards</SelectItem>
              {wards.map((w: any) => (
                <SelectItem key={w.id} value={w.id.toString()}>
                  Ward {w.ward_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-9 px-3 text-error-red hover:bg-error-red/10 rounded-xl flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Count */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold">
              <Filter className="w-3 h-3 mr-1" />
              {activeFilterCount} Active
            </Badge>
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex items-center gap-4 p-4">
        {/* Search - Takes Available Space */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking ID, title, or citizen name..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 h-10 bg-muted border-border focus:bg-card text-sm rounded-xl"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Status */}
          <Select
            value={filters.status?.[0] || "all"}
            onValueChange={(val) =>
              updateFilter("status", val === "all" ? [] : [val])
            }
          >
            <SelectTrigger className="h-10 w-[140px] text-xs font-bold uppercase tracking-wider bg-muted border-border rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select
            value={filters.priority?.[0] || "all"}
            onValueChange={(val) =>
              updateFilter("priority", val === "all" ? [] : [val])
            }
          >
            <SelectTrigger className="h-10 w-[140px] text-xs font-bold uppercase tracking-wider bg-muted border-border rounded-xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Ward */}
          <Select
            value={filters.ward_id || "all"}
            onValueChange={(val) =>
              updateFilter("ward_id", val === "all" ? null : val)
            }
          >
            <SelectTrigger className="h-10 w-[140px] text-xs font-bold uppercase tracking-wider bg-muted border-border rounded-xl">
              <SelectValue placeholder="Ward" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-[400px]">
              <SelectItem value="all">All Wards</SelectItem>
              {wards.map((w: any) => (
                <SelectItem key={w.id} value={w.id.toString()}>
                  Ward {w.ward_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <>
              <div className="w-px h-8 bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-10 px-4 text-muted-foreground hover:text-error-red hover:bg-error-red/10 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Reset ({activeFilterCount})
                </span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}