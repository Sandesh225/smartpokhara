"use client";

import { ComplaintFiltersState } from "@/types/admin-complaints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { X, Search, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
  wards = [],
  onClear
}: ComplaintFiltersProps) {
  
  if (!filters) return null;

  const updateFilter = (key: keyof ComplaintFiltersState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = [
    filters.search,
    filters.status?.length,
    filters.priority?.length,
    filters.ward_id
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Integrated Header/Toolbar */}
      <div className="flex flex-wrap items-center gap-4 p-3">
        
        {/* Search - Flexible Width */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input 
            placeholder="Search by ID, title, or citizen..." 
            value={filters.search || ""} 
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white text-xs rounded-xl transition-all"
          />
        </div>

        {/* Vertical Separator */}
        <div className="hidden lg:block w-px h-6 bg-slate-200" />

        {/* Filter Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="w-[130px]">
            <Select 
              value={filters.status?.[0] || "all"} 
              onValueChange={(val) => updateFilter("status", val === "all" ? [] : [val])}
            >
              <SelectTrigger className="h-9 text-[11px] font-bold uppercase tracking-wider bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="in_progress">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Select */}
          <div className="w-[130px]">
            <Select 
              value={filters.priority?.[0] || "all"} 
              onValueChange={(val) => updateFilter("priority", val === "all" ? [] : [val])}
            >
              <SelectTrigger className="h-9 text-[11px] font-bold uppercase tracking-wider bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ward Select */}
          <div className="w-[130px]">
            <Select 
              value={filters.ward_id || "all"} 
              onValueChange={(val) => updateFilter("ward_id", val === "all" ? null : val)}
            >
              <SelectTrigger className="h-9 text-[11px] font-bold uppercase tracking-wider bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((w: any) => (
                  <SelectItem key={w.id} value={w.id.toString()}>Ward {w.ward_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}