"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Filter,
  Search,
  MapPin,
  Calendar as CalendarIcon,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ... (Keep existing interfaces and NOTICE_TYPES array) ...
// Assuming Interface FilterState and NoticeFiltersProps are same as previous

export default function NoticeFilters({ onFilterChange, initialFilters, wards }: any) {
  // ... (Keep logic same as previous) ...
  // Replicating just the UI/UX render part below for brevity, assume state logic exists

  const [filters, setFilters] = useState<any>({ search: "", ward: "", type: "", dateFrom: undefined, dateTo: undefined, unreadOnly: false, urgentOnly: false, ...initialFilters });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Hooks for state syncing... (same as before)

  return (
    <div className="stone-panel p-6 shadow-xl shadow-[rgb(var(--neutral-stone-300)/0.2)] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[rgb(var(--primary-brand))]">
          <Filter className="w-5 h-5" />
          <h2 className="font-bold text-lg tracking-tight">Refine</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({ search: "", ward: "", type: "", dateFrom: undefined, dateTo: undefined, unreadOnly: false, urgentOnly: false })}
          className="text-xs text-[rgb(var(--neutral-stone-500))] hover:text-[rgb(var(--error-red))]"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
        </Button>
      </div>

      <div className="space-y-5">
        {/* Search */}
        <div className="space-y-2">
           <Label className="text-[10px] font-black uppercase text-[rgb(var(--neutral-stone-400))] tracking-widest">Keywords</Label>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--neutral-stone-400))]" />
             <Input 
                placeholder="Search notices..." 
                value={debouncedSearch}
                onChange={(e) => setDebouncedSearch(e.target.value)}
                className="pl-9 bg-[rgb(var(--neutral-stone-50))] border-[rgb(var(--neutral-stone-200))] rounded-xl h-11 focus-visible:ring-[rgb(var(--primary-brand))]"
             />
           </div>
        </div>

        {/* Filters Grid */}
        <div className="space-y-4">
           {/* Location */}
           <div className="space-y-2">
             <Label className="text-[10px] font-black uppercase text-[rgb(var(--neutral-stone-400))] tracking-widest">Ward Location</Label>
             <Select value={filters.ward || "all"} onValueChange={(v) => setFilters({...filters, ward: v === "all" ? "" : v})}>
               <SelectTrigger className="bg-[rgb(var(--neutral-stone-50))] border-[rgb(var(--neutral-stone-200))] rounded-xl h-11">
                 <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-[rgb(var(--accent-nature))]" />
                   <SelectValue placeholder="All Wards" />
                 </div>
               </SelectTrigger>
               <SelectContent className="rounded-xl border-[rgb(var(--neutral-stone-200))]">
                 <SelectItem value="all">All Wards</SelectItem>
                 {wards?.map((w: any) => <SelectItem key={w.id} value={w.ward_number.toString()}>Ward {w.ward_number}</SelectItem>)}
               </SelectContent>
             </Select>
           </div>

           {/* Type */}
           <div className="space-y-2">
             <Label className="text-[10px] font-black uppercase text-[rgb(var(--neutral-stone-400))] tracking-widest">Category</Label>
             <Select value={filters.type || "all"} onValueChange={(v) => setFilters({...filters, type: v === "all" ? "" : v})}>
               <SelectTrigger className="bg-[rgb(var(--neutral-stone-50))] border-[rgb(var(--neutral-stone-200))] rounded-xl h-11">
                 <SelectValue placeholder="All Categories" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-[rgb(var(--neutral-stone-200))]">
                 <SelectItem value="all">All Categories</SelectItem>
                 {/* Map types here */}
                 <SelectItem value="announcement">Announcement</SelectItem>
                 <SelectItem value="emergency">Emergency</SelectItem>
                 <SelectItem value="tender">Tender</SelectItem>
               </SelectContent>
             </Select>
           </div>
        </div>

        {/* Toggles */}
        <div className="bg-[rgb(var(--neutral-stone-50))] rounded-2xl p-4 space-y-4 border border-[rgb(var(--neutral-stone-100))]">
           <div className="flex items-center justify-between">
             <Label htmlFor="unread" className="font-bold text-sm cursor-pointer">Unread Only</Label>
             <Switch 
                id="unread" 
                checked={filters.unreadOnly} 
                onCheckedChange={(v) => setFilters({...filters, unreadOnly: v})}
                className="data-[state=checked]:bg-[rgb(var(--primary-brand))]"
             />
           </div>
           <div className="flex items-center justify-between">
             <Label htmlFor="urgent" className="font-bold text-sm cursor-pointer text-[rgb(var(--highlight-tech))]">Urgent Only</Label>
             <Switch 
                id="urgent" 
                checked={filters.urgentOnly} 
                onCheckedChange={(v) => setFilters({...filters, urgentOnly: v})}
                className="data-[state=checked]:bg-[rgb(var(--highlight-tech))]"
             />
           </div>
        </div>

        <Button 
          onClick={() => onFilterChange(filters)}
          className="w-full h-12 rounded-xl bg-[rgb(var(--primary-brand))] hover:bg-[rgb(var(--primary-brand-dark))] text-white font-bold shadow-lg shadow-blue-900/10"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}