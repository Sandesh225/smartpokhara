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
import {
  Calendar as CalendarIcon,
  Filter,
  X,
  Search,
  Clock,
  MapPin,
  Tag,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Badge,
} from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync debounced search to filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== filters.search) {
        setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch, filters.search]);

  // Sync URL params to local state
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters: Partial<FilterState> = {};

    if (params.get("search")) newFilters.search = params.get("search")!;
    if (params.get("ward")) newFilters.ward = params.get("ward")!;
    if (params.get("type")) newFilters.type = params.get("type")!;
    if (params.get("dateFrom"))
      newFilters.dateFrom = new Date(params.get("dateFrom")!);
    if (params.get("dateTo"))
      newFilters.dateTo = new Date(params.get("dateTo")!);
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
    toast.success("Filters updated");
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
    toast.info("All filters cleared");
  };

  const applyQuickDateFilter = (days: number) => {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    setFilters((prev) => ({ ...prev, dateFrom, dateTo: new Date() }));
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.ward ||
    filters.type ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.unreadOnly ||
    filters.urgentOnly
  );

  const activeFilterCount = [
    filters.search,
    filters.ward,
    filters.type,
    filters.dateFrom,
    filters.dateTo,
    filters.unreadOnly,
    filters.urgentOnly,
  ].filter(Boolean).length;

  return (
    <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2rem] bg-white/80 backdrop-blur-xl ring-1 ring-slate-200 overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-3 text-slate-900">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tight">Refine View</span>
            {hasActiveFilters && (
              <Badge className="bg-blue-600 text-white border-0 h-6 px-2 rounded-full">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden h-8 w-8 rounded-full"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "space-y-6 pt-6 transition-all duration-300 ease-in-out",
          isCollapsed && "lg:block hidden h-0 py-0 overflow-hidden opacity-0"
        )}
      >
        {/* Keyword Search */}
        <div className="space-y-2.5">
          <Label
            htmlFor="search"
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
          >
            Keyword Search
          </Label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              id="search"
              placeholder="Title, content, or ID..."
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="pl-10 h-12 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>
        </div>

        {/* Quick Dates */}
        <div className="space-y-2.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Recency
          </Label>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                variant="outline"
                size="sm"
                onClick={() => applyQuickDateFilter(days)}
                className={cn(
                  "rounded-full h-9 px-4 font-bold border-slate-200 transition-all",
                  filters.dateFrom &&
                    format(filters.dateFrom, "P") ===
                      format(new Date(Date.now() - days * 86400000), "P")
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Ward Selector - FIXED SCROLLING & VALUE */}
        <div className="space-y-2.5">
          <Label
            htmlFor="ward"
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
          >
            Location Filter
          </Label>
          <Select
            value={filters.ward || "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, ward: v === "all" ? "" : v })
            }
          >
            <SelectTrigger
              id="ward"
              className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm font-bold"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <SelectValue placeholder="All Wards" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] rounded-2xl shadow-2xl border-slate-200">
              <SelectItem value="all" className="font-bold text-slate-500">
                All Wards
              </SelectItem>
              <Separator className="my-1 opacity-50" />
              {wards.map((ward) => (
                <SelectItem
                  key={ward.id}
                  value={ward.ward_number.toString()}
                  className="font-medium cursor-pointer"
                >
                  Ward {ward.ward_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notice Type Selector - FIXED VALUE */}
        <div className="space-y-2.5">
          <Label
            htmlFor="type"
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
          >
            Category
          </Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, type: v === "all" ? "" : v })
            }
          >
            <SelectTrigger
              id="type"
              className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm font-bold"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                <SelectValue placeholder="All Types" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] rounded-2xl shadow-2xl border-slate-200">
              <SelectItem value="all" className="font-bold text-slate-500">
                All Categories
              </SelectItem>
              <Separator className="my-1 opacity-50" />
              {NOTICE_TYPES.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="font-medium"
                >
                  <span className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    {type.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 transition-all hover:shadow-inner group">
            <div className="space-y-0.5">
              <Label
                htmlFor="unreadOnly"
                className="text-sm font-bold text-slate-900 cursor-pointer"
              >
                Unread
              </Label>
              <p className="text-[10px] text-slate-500 font-medium">
                New notifications only
              </p>
            </div>
            <Switch
              id="unreadOnly"
              checked={filters.unreadOnly}
              onCheckedChange={(v) => setFilters({ ...filters, unreadOnly: v })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-100/50 transition-all hover:shadow-inner group">
            <div className="space-y-0.5">
              <Label
                htmlFor="urgentOnly"
                className="text-sm font-bold text-slate-900 cursor-pointer flex items-center gap-1.5"
              >
                Urgent <Sparkles className="h-3 w-3 text-red-500" />
              </Label>
              <p className="text-[10px] text-slate-500 font-medium">
                High priority alerts
              </p>
            </div>
            <Switch
              id="urgentOnly"
              checked={filters.urgentOnly}
              onCheckedChange={(v) => setFilters({ ...filters, urgentOnly: v })}
            />
          </div>
        </div>

        {/* Custom Range Popover */}
        <div className="space-y-2.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Custom Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold justify-start px-3"
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-blue-500" />
                  {filters.dateFrom
                    ? format(filters.dateFrom, "MMM d")
                    : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(d) => setFilters({ ...filters, dateFrom: d })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold justify-start px-3"
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-blue-500" />
                  {filters.dateTo ? format(filters.dateTo, "MMM d") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(d) => setFilters({ ...filters, dateTo: d })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex gap-3">
          <Button
            onClick={handleApplyFilters}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}