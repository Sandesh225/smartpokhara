"use client"

import type React from "react"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SortAsc } from "lucide-react"
import type { ComplaintStatus, Priority, ComplaintFilters } from "@/lib/types/complaints"

interface QueueFiltersProps {
  filters: ComplaintFilters
  onFiltersChange: (filters: ComplaintFilters) => void
  sortBy: string
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void
}

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "received", label: "Received" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const SORT_OPTIONS = [
  { value: "submitted_at-desc", label: "Newest first" },
  { value: "submitted_at-asc", label: "Oldest first" },
  { value: "sla_due_at-asc", label: "SLA due soon" },
  { value: "priority-desc", label: "Priority (high → low)" },
  { value: "priority-asc", label: "Priority (low → high)" },
]

export function QueueFilters({ filters, onFiltersChange, sortBy, sortOrder, onSortChange }: QueueFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, searchTerm })
  }

  const handleStatusToggle = (status: ComplaintStatus) => {
    const current = filters.status || []
    const updated = current.includes(status) ? current.filter((s) => s !== status) : [...current, status]
    onFiltersChange({ ...filters, status: updated })
  }

  const handlePriorityToggle = (priority: Priority) => {
    const current = filters.priority || []
    const updated = current.includes(priority) ? current.filter((p) => p !== priority) : [...current, priority]
    onFiltersChange({ ...filters, priority: updated })
  }

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-")
    onSortChange(field, order as "asc" | "desc")
  }

  const clearFilters = () => {
    setSearchTerm("")
    onFiltersChange({})
  }

  const activeFilterCount =
    (filters.status?.length || 0) + (filters.priority?.length || 0) + (filters.searchTerm ? 1 : 0)

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking code, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-0 text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((option) => (
                    <Badge
                      key={option.value}
                      variant={filters.status?.includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleStatusToggle(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                <div className="flex flex-wrap gap-1">
                  {PRIORITY_OPTIONS.map((option) => (
                    <Badge
                      key={option.value}
                      variant={filters.priority?.includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handlePriorityToggle(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-44">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
