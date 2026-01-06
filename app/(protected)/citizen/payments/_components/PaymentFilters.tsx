// components/citizen/payments/PaymentFilters.tsx
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Filter,
  X,
  Search,
  CreditCard,
  Receipt,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PaymentFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onClear: () => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  search: string;
  billType: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

const BILL_TYPES = [
  { value: "property_tax", label: "Property Tax" },
  { value: "water_bill", label: "Water Bill" },
  { value: "electricity_bill", label: "Electricity Bill" },
  { value: "waste_management", label: "Waste Management" },
  { value: "parking_fee", label: "Parking Fee" },
  { value: "business_license", label: "Business License" },
  { value: "building_permit", label: "Building Permit" },
  { value: "event_permit", label: "Event Permit" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed", icon: CheckCircle },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "failed", label: "Failed", icon: X },
  { value: "refunded", label: "Refunded", icon: CreditCard },
];

export default function PaymentFilters({
  onFilterChange,
  onClear,
  initialFilters,
}: PaymentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    billType: "",
    status: "",
    dateFrom: undefined,
    dateTo: undefined,
    ...initialFilters,
  });

  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters: Partial<FilterState> = {};

    if (params.get("search")) newFilters.search = params.get("search")!;
    if (params.get("billType")) newFilters.billType = params.get("billType")!;
    if (params.get("status")) newFilters.status = params.get("status")!;
    if (params.get("dateFrom")) newFilters.dateFrom = new Date(params.get("dateFrom")!);
    if (params.get("dateTo")) newFilters.dateTo = new Date(params.get("dateTo")!);

    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, [searchParams]);

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearAll = () => {
    setFilters({
      search: "",
      billType: "",
      status: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
    onClear();
  };

  const handleQuickDateFilter = (days: number) => {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    const dateTo = new Date();

    setFilters((prev) => ({
      ...prev,
      dateFrom,
      dateTo,
    }));
  };

  const hasActiveFilters =
    filters.search ||
    filters.billType ||
    filters.status ||
    filters.dateFrom ||
    filters.dateTo;

  // Count active filters
  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.billType ? 1 : 0,
    filters.status ? 1 : 0,
    filters.dateFrom ? 1 : 0,
    filters.dateTo ? 1 : 0,
  ].reduce((sum, val) => sum + val, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Payments
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100"
              >
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Payments</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by receipt, transaction ID, bill number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <Separator />

        {/* Quick Date Filters */}
        <div className="space-y-2">
          <Label>Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { days: 7, label: "Last 7 days" },
              { days: 30, label: "Last 30 days" },
              { days: 90, label: "Last 90 days" },
              { days: 365, label: "Last year" },
            ].map(({ days, label }) => (
              <Button
                key={days}
                variant="outline"
                size="sm"
                onClick={() => handleQuickDateFilter(days)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bill Type */}
        <div className="space-y-2">
          <Label htmlFor="bill-type">Bill Type</Label>
          <Select
            value={filters.billType}
            onValueChange={(value) => setFilters({ ...filters, billType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All bill types" />
            </SelectTrigger>
            <SelectContent>
              {BILL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Payment Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center">
                    {status.icon && <status.icon className="mr-2 h-4 w-4" />}
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal text-sm",
                    !filters.dateFrom && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, "MMM d") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters({ ...filters, dateFrom: date ?? undefined })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal text-sm",
                    !filters.dateTo && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(filters.dateTo, "MMM d") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters({ ...filters, dateTo: date ?? undefined })}
                  initialFocus
                  disabled={(date) =>
                    filters.dateFrom ? date < filters.dateFrom : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* More Filters Toggle */}
        {!showMoreFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreFilters(true)}
            className="w-full text-sm text-blue-600"
          >
            + More filters
          </Button>
        )}

        {/* More Filters */}
        {showMoreFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Additional Filters</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMoreFilters(false)}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label className="text-sm">Amount Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Min" type="number" min="0" />
                <Input placeholder="Max" type="number" min="0" />
              </div>
            </div>

            {/* Payment Method (still visual only, but fixed values) */}
            <div className="space-y-2">
              <Label className="text-sm">Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esewa">eSewa</SelectItem>
                  <SelectItem value="khalti">Khalti</SelectItem>
                  <SelectItem value="connect_ips">Connect IPS</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Active Filters</p>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: {filters.search}
                  <button
                    onClick={() => setFilters({ ...filters, search: "" })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.billType && (
                <Badge variant="secondary" className="text-xs">
                  Type: {BILL_TYPES.find((t) => t.value === filters.billType)?.label}
                  <button
                    onClick={() => setFilters({ ...filters, billType: "" })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="text-xs">
                  Status: {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
                  <button
                    onClick={() => setFilters({ ...filters, status: "" })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="text-xs">
                  Date:{" "}
                  {filters.dateFrom
                    ? format(filters.dateFrom, "MM/dd/yyyy")
                    : "Any"}{" "}
                  -{" "}
                  {filters.dateTo ? format(filters.dateTo, "MM/dd/yyyy") : "Any"}
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        dateFrom: undefined,
                        dateTo: undefined,
                      })
                    }
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
