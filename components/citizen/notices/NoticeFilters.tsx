"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Filter, X, Search, Sparkles, Clock, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NoticeFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  wards?: Array<{ id: string; ward_number: number }>;
}

export interface FilterState {
  search: string;
  ward: string;
  type: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  unreadOnly: boolean;
  urgentOnly: boolean;
}

const NOTICE_TYPES = [
  { value: "announcement", label: "Announcement", icon: "📢" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "public_service", label: "Public Service", icon: "🏛️" },
  { value: "payment", label: "Payment", icon: "💳" },
  { value: "event", label: "Event", icon: "📅" },
  { value: "emergency", label: "Emergency", icon: "🚨" },
  { value: "tender", label: "Tender", icon: "📋" },
  { value: "policy", label: "Policy Update", icon: "📜" },
  { value: "holiday", label: "Holiday Notice", icon: "🎉" },
];

export default function NoticeFilters({
  onFilterChange,
  initialFilters,
  wards = Array.from({ length: 33 }, (_, i) => ({
    id: (i + 1).toString(),
    ward_number: i + 1,
  })),
}: NoticeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    ward: "",
    type: "",
    dateFrom: undefined,
    dateTo: undefined,
    unreadOnly: false,
    urgentOnly: false,
    ...initialFilters,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== filters.search) {
        setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearch, filters.search]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters: Partial<FilterState> = {};

    if (params.get("search")) newFilters.search = params.get("search")!;
    if (params.get("ward")) newFilters.ward = params.get("ward")!;
    if (params.get("type")) newFilters.type = params.get("type")!;
    if (params.get("dateFrom"))
      newFilters.dateFrom = new Date(params.get("dateFrom")!);
    if (params.get("dateTo")) newFilters.dateTo = new Date(params.get("dateTo")!);
    if (params.get("unreadOnly"))
      newFilters.unreadOnly = params.get("unreadOnly") === "true";
    if (params.get("urgentOnly"))
      newFilters.urgentOnly = params.get("urgentOnly") === "true";

    setFilters((prev) => ({ ...prev, ...newFilters }));
    setDebouncedSearch(newFilters.search || "");
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.ward) params.set("ward", filters.ward);
    if (filters.type) params.set("type", filters.type);
    if (filters.dateFrom)
      params.set("dateFrom", format(filters.dateFrom, "yyyy-MM-dd"));
    if (filters.dateTo)
      params.set("dateTo", format(filters.dateTo, "yyyy-MM-dd"));
    if (filters.unreadOnly) params.set("unreadOnly", "true");
    if (filters.urgentOnly) params.set("urgentOnly", "true");

    params.set("page", "1");
    router.push(`/citizen/notices?${params.toString()}`);
    onFilterChange(filters);
    
    toast.success("Filters applied", { duration: 2000 });
  };

  const handleClearFilters = () => {
    const cleared: FilterState = {
      search: "",
      ward: "",
      type: "",
      dateFrom: undefined,
      dateTo: undefined,
      unreadOnly: false,
      urgentOnly: false,
    };
    setFilters(cleared);
    setDebouncedSearch("");
    router.push("/citizen/notices");
    onFilterChange(cleared);
    
    toast.success("Filters cleared", { duration: 2000 });
  };

  const hasActiveFilters =
    filters.search ||
    filters.ward ||
    filters.type ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.unreadOnly ||
    filters.urgentOnly;

  const applyQuickDateFilter = (days: number) => {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    const dateTo = new Date();

    setFilters((prev) => ({
      ...prev,
      dateFrom,
      dateTo,
    }));
  };

  return (
    <Card className="border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 opacity-50 pointer-events-none" />
      
      <CardHeader className="relative bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm border-b-2 border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-3 text-slate-900">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">Filters</span>
            {hasActiveFilters && (
              <span className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full font-semibold shadow-md">
                Active
              </span>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-3 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6 relative">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" />
            Search Notices
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search"
              placeholder="Search by title or content..."
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Quick Filters
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickDateFilter(7)}
              className={cn(
                "border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-all",
                filters.dateFrom &&
                format(filters.dateFrom, "yyyy-MM-dd") ===
                  format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
                  ? "bg-blue-50 border-blue-400 text-blue-700"
                  : ""
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickDateFilter(30)}
              className={cn(
                "border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-all",
                filters.dateFrom &&
                format(filters.dateFrom, "yyyy-MM-dd") ===
                  format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
                  ? "bg-blue-50 border-blue-400 text-blue-700"
                  : ""
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              30 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickDateFilter(90)}
              className={cn(
                "border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-all",
                filters.dateFrom &&
                format(filters.dateFrom, "yyyy-MM-dd") ===
                  format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
                  ? "bg-blue-50 border-blue-400 text-blue-700"
                  : ""
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              90 days
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="space-y-2">
          <Label htmlFor="ward" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            Ward
          </Label>
          <Select
            value={filters.ward}
            onValueChange={(value) => setFilters({ ...filters, ward: value })}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <SelectValue placeholder="All Wards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Wards</SelectItem>
              {wards.map((ward) => (
                <SelectItem key={ward.id} value={ward.ward_number.toString()}>
                  Ward {ward.ward_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600" />
            Notice Type
          </Label>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {NOTICE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <span className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal text-sm border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-all",
                    !filters.dateFrom && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, "MMM d") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) =>
                    setFilters({ ...filters, dateFrom: date ?? undefined })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal text-sm border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-all",
                    !filters.dateTo && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(filters.dateTo, "MMM d") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) =>
                    setFilters({ ...filters, dateTo: date ?? undefined })
                  }
                  initialFocus
                  disabled={(date) =>
                    filters.dateFrom ? date < filters.dateFrom : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 transition-all hover:shadow-md">
            <div className="space-y-0.5">
              <Label htmlFor="unreadOnly" className="text-sm font-semibold text-slate-900">
                Unread Only
              </Label>
              <p className="text-xs text-slate-600">Show only unread notices</p>
            </div>
            <Switch
              id="unreadOnly"
              checked={filters.unreadOnly}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, unreadOnly: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 transition-all hover:shadow-md">
            <div className="space-y-0.5">
              <Label htmlFor="urgentOnly" className="text-sm font-semibold text-slate-900">
                Urgent Only
              </Label>
              <p className="text-xs text-slate-600">Show only urgent notices</p>
            </div>
            <Switch
              id="urgentOnly"
              checked={filters.urgentOnly}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, urgentOnly: checked })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="flex-1 border-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button
            onClick={handleApplyFilters}
            disabled={!hasActiveFilters}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}