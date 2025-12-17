"use client";

import { PaymentFiltersState } from "@/types/admin-payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search } from "lucide-react";

interface TransactionFiltersProps {
  filters: PaymentFiltersState;
  onFilterChange: (filters: PaymentFiltersState) => void;
  onClear: () => void;
}

export function TransactionFilters({ filters, onFilterChange, onClear }: TransactionFiltersProps) {
  const updateFilter = (key: keyof PaymentFiltersState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
           <Input 
             placeholder="Search by Transaction ID..." 
             value={filters.search}
             onChange={(e) => updateFilter("search", e.target.value)}
             className="pl-9"
           />
        </div>
        
        <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
           <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
           <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
           </SelectContent>
        </Select>

        <Select value={filters.method} onValueChange={(v) => updateFilter("method", v)}>
           <SelectTrigger className="w-[180px]"><SelectValue placeholder="Method" /></SelectTrigger>
           <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="esewa">eSewa</SelectItem>
              <SelectItem value="khalti">Khalti</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
           </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={onClear}>
           <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}