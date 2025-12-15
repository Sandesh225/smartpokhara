'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Filter,
  X,
  CalendarIcon,
  Search,
  Tag,
  MapPin,
  Check,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComplaintStatus, ComplaintPriority } from '@/lib/supabase/queries/complaints';

interface ComplaintFiltersProps {
  statuses: string[];
  priorities: string[];
  categories: Array<{ id: string; name: string }>;
  wards: Array<{ id: string; ward_number: number; name: string }>;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  status: ComplaintStatus[];
  priority: ComplaintPriority[];
  category_id: string | null;
  ward_id: string | null;
  date_from: Date | null;
  date_to: Date | null;
}

const statusOptions: { value: ComplaintStatus; label: string }[] = [
  { value: 'received', label: 'Received' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reopened', label: 'Reopened' },
];

const priorityOptions: { value: ComplaintPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function ComplaintFilters({
  statuses,
  priorities,
  categories,
  wards,
  onFilterChange,
}: ComplaintFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    category_id: null,
    ward_id: null,
    date_from: null,
    date_to: null,
  });
  const [activeFilters, setActiveFilters] = useState<
    Array<{ key: string; label: string; value: string }>
  >([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters: FilterState = {
      search: params.get('search') || '',
      status:
        (params.get('status')?.split(',').filter(Boolean) as ComplaintStatus[]) ||
        [],
      priority:
        (params.get('priority')?.split(',').filter(Boolean) as ComplaintPriority[]) ||
        [],
      category_id: params.get('category') || null,
      ward_id: params.get('ward') || null,
      date_from: params.get('date_from') ? new Date(params.get('date_from')!) : null,
      date_to: params.get('date_to') ? new Date(params.get('date_to')!) : null,
    };

    setFilters(newFilters);
    updateActiveFilters(newFilters);
  }, [searchParams]);

  const updateActiveFilters = (filterState: FilterState) => {
    const active: Array<{ key: string; label: string; value: string }> = [];

    if (filterState.search) {
      active.push({
        key: 'search',
        label: 'Search',
        value: filterState.search,
      });
    }

    if (filterState.status.length > 0) {
      active.push({
        key: 'status',
        label: 'Status',
        value: filterState.status
          .map(
            (s) => statusOptions.find((opt) => opt.value === s)?.label || s
          )
          .join(', '),
      });
    }

    if (filterState.priority.length > 0) {
      active.push({
        key: 'priority',
        label: 'Priority',
        value: filterState.priority
          .map(
            (p) => priorityOptions.find((opt) => opt.value === p)?.label || p
          )
          .join(', '),
      });
    }

    if (filterState.category_id) {
      const category = categories.find((c) => c.id === filterState.category_id);
      if (category) {
        active.push({
          key: 'category',
          label: 'Category',
          value: category.name,
        });
      }
    }

    if (filterState.ward_id) {
      const ward = wards.find((w) => w.id === filterState.ward_id);
      if (ward) {
        active.push({
          key: 'ward',
          label: 'Ward',
          value: `Ward ${ward.ward_number}`,
        });
      }
    }

    if (filterState.date_from || filterState.date_to) {
      let dateRange = '';
      if (filterState.date_from) {
        dateRange += format(filterState.date_from, 'MMM dd, yyyy');
      }
      if (filterState.date_from && filterState.date_to) {
        dateRange += ' - ';
      }
      if (filterState.date_to) {
        dateRange += format(filterState.date_to, 'MMM dd, yyyy');
      }
      active.push({
        key: 'date',
        label: 'Date Range',
        value: dateRange,
      });
    }

    setActiveFilters(active);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.status.length > 0)
      params.set('status', filters.status.join(','));
    if (filters.priority.length > 0)
      params.set('priority', filters.priority.join(','));
    if (filters.category_id) params.set('category', filters.category_id);
    if (filters.ward_id) params.set('ward', filters.ward_id);
    if (filters.date_from)
      params.set('date_from', format(filters.date_from, 'yyyy-MM-dd'));
    if (filters.date_to)
      params.set('date_to', format(filters.date_to, 'yyyy-MM-dd'));

    router.push(`?${params.toString()}`);
    onFilterChange(filters);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    const cleared: FilterState = {
      search: '',
      status: [],
      priority: [],
      category_id: null,
      ward_id: null,
      date_from: null,
      date_to: null,
    };
    setFilters(cleared);
    router.push('');
    onFilterChange(cleared);
    setActiveFilters([]);
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };

    switch (key) {
      case 'search':
        newFilters.search = '';
        break;
      case 'status':
        newFilters.status = [];
        break;
      case 'priority':
        newFilters.priority = [];
        break;
      case 'category':
        newFilters.category_id = null;
        break;
      case 'ward':
        newFilters.ward_id = null;
        break;
      case 'date':
        newFilters.date_from = null;
        newFilters.date_to = null;
        break;
    }

    setFilters(newFilters);
    updateActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const quickFilters = [
    {
      label: 'Last 7 Days',
      icon: CalendarIcon,
      onClick: () => {
        const newFilters = {
          ...filters,
          date_from: subDays(new Date(), 7),
          date_to: new Date(),
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
      },
    },
    {
      label: 'In Progress',
      icon: Filter,
      onClick: () => {
        const newFilters = {
          ...filters,
          status: ['in_progress' as ComplaintStatus, 'assigned' as ComplaintStatus],
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
      },
    },
    {
      label: 'Resolved',
      icon: Check,
      onClick: () => {
        const newFilters = {
          ...filters,
          status: ['resolved' as ComplaintStatus, 'closed' as ComplaintStatus],
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
      },
    },
    {
      label: 'High Priority',
      icon: Sparkles,
      onClick: () => {
        const newFilters = {
          ...filters,
          priority: ['critical' as ComplaintPriority, 'urgent' as ComplaintPriority, 'high' as ComplaintPriority],
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by tracking code or title..."
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all">
                <Filter className="h-4 w-4" />
                Status
                {filters.status.length > 0 && (
                  <Badge
                    className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center bg-blue-600 text-white text-xs font-semibold"
                  >
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search status..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>
                  <CommandGroup>
                    {statusOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const isSelected = filters.status.includes(
                            option.value
                          );
                          const newStatus = isSelected
                            ? filters.status.filter((s) => s !== option.value)
                            : [...filters.status, option.value];
                          handleFilterChange('status', newStatus);
                        }}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded border transition-colors',
                            filters.status.includes(option.value)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300'
                          )}
                        >
                          {filters.status.includes(option.value) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Select
            value={filters.category_id ?? 'all'}
            onValueChange={(value) =>
              handleFilterChange(
                'category_id',
                value === 'all' ? null : value
              )
            }
          >
            <SelectTrigger className="w-[180px] border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.ward_id ?? 'all'}
            onValueChange={(value) =>
              handleFilterChange('ward_id', value === 'all' ? null : value)
            }
          >
            <SelectTrigger className="w-[180px] border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <SelectValue placeholder="Ward" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {wards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id}>
                  Ward {ward.ward_number} - {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={applyFilters} 
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            disabled={activeFilters.length === 0}
            className="border-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search complaints..."
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="relative border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
                          <SheetContent side="right" className="w-[85vw] sm:w-[400px] flex flex-col p-0">
              <SheetHeader className="pb-4 px-4 pt-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  Filter Complaints
                </SheetTitle>
                <SheetDescription>
                  Refine results by status, category, ward, and date range
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={
                          filters.status.includes(option.value)
                            ? 'default'
                            : 'outline'
                        }
                        className={cn(
                          "cursor-pointer transition-all",
                          filters.status.includes(option.value)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'hover:bg-blue-50 hover:border-blue-400'
                        )}
                        onClick={() => {
                          const isSelected = filters.status.includes(
                            option.value
                          );
                          const newStatus = isSelected
                            ? filters.status.filter((s) => s !== option.value)
                            : [...filters.status, option.value];
                          handleFilterChange('status', newStatus);
                        }}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Priority</Label>
                  <div className="flex flex-wrap gap-2">
                    {priorityOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={
                          filters.priority.includes(option.value)
                            ? 'default'
                            : 'outline'
                        }
                        className={cn(
                          "cursor-pointer transition-all",
                          filters.priority.includes(option.value)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'hover:bg-blue-50 hover:border-blue-400'
                        )}
                        onClick={() => {
                          const isSelected = filters.priority.includes(
                            option.value
                          );
                          const newPriority = isSelected
                            ? filters.priority.filter((p) => p !== option.value)
                            : [...filters.priority, option.value];
                          handleFilterChange('priority', newPriority);
                        }}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Category</Label>
                  <Select
                    value={filters.category_id ?? 'all'}
                    onValueChange={(value) =>
                      handleFilterChange(
                        'category_id',
                        value === 'all' ? null : value
                      )
                    }
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Ward</Label>
                  <Select
                    value={filters.ward_id ?? 'all'}
                    onValueChange={(value) =>
                      handleFilterChange(
                        'ward_id',
                        value === 'all' ? null : value
                      )
                    }
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wards</SelectItem>
                      {wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          Ward {ward.ward_number} - {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'justify-start text-left font-normal border-slate-300',
                            !filters.date_from && 'text-slate-500'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.date_from
                            ? format(filters.date_from, 'MMM dd')
                            : 'From'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.date_from || undefined}
                          onSelect={(date) =>
                            handleFilterChange('date_from', date || null)
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
                            'justify-start text-left font-normal border-slate-300',
                            !filters.date_to && 'text-slate-500'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.date_to
                            ? format(filters.date_to, 'MMM dd')
                            : 'To'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.date_to || undefined}
                          onSelect={(date) =>
                            handleFilterChange('date_to', date || null)
                          }
                          initialFocus
                          disabled={(date) =>
                            date < (filters.date_from || new Date(0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Quick Filters
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickFilters.map((filter, index) => {
                      const Icon = filter.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start gap-2 border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-all"
                          onClick={filter.onClick}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {filter.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t px-4 pb-4 bg-white">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    disabled={activeFilters.length === 0}
                    className="flex-1 border-slate-300"
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={applyFilters} 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-slate-700">
              Active Filters ({activeFilters.length})
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                className="gap-2 pl-3 pr-2 py-1.5 bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200 transition-colors"
              >
                <span className="font-semibold text-xs">{filter.label}:</span>
                <span className="font-normal text-xs max-w-[150px] truncate">{filter.value}</span>
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="ml-1 rounded-full hover:bg-blue-300 p-0.5 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}