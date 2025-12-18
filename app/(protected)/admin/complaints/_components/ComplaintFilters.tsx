"use client";

import { ComplaintFiltersState } from "@/types/admin-complaints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { X, Search, Filter } from "lucide-react";

interface ComplaintFiltersProps {
  filters: ComplaintFiltersState;
  onFilterChange: (filters: ComplaintFiltersState) => void;
  categories?: any[];
  wards?: any[];
  onClear?: () => void;
}

export function ComplaintFilters({ 
  filters, 
  onFilterChange, 
  categories = [], 
  wards = [],
  onClear
}: ComplaintFiltersProps) {
  
  if (!filters) return null;

  const updateFilter = (key: keyof ComplaintFiltersState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const searchValue = filters.search || "";
  const statusValue = (filters.status && filters.status.length > 0) ? filters.status[0] : "all";
  const priorityValue = (filters.priority && filters.priority.length > 0) ? filters.priority[0] : "all";
  const wardValue = filters.ward_id || "all";

  const activeFilterCount = [
    filters.search,
    filters.status?.length,
    filters.priority?.length,
    filters.ward_id
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="text-gray-500 hover:text-gray-700 h-8 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="ID, title, citizen name..." 
                value={searchValue} 
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select 
              value={statusValue} 
              onValueChange={(val) => updateFilter("status", val === "all" ? [] : [val])}
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Select 
              value={priorityValue} 
              onValueChange={(val) => updateFilter("priority", val === "all" ? [] : [val])}
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ward */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Ward
            </label>
            <Select 
              value={wardValue} 
              onValueChange={(val) => updateFilter("ward_id", val === "all" ? null : val)}
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((w: any) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    Ward {w.ward_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}