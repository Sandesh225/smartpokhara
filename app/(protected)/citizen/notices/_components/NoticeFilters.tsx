"use client";

import { useState } from "react";
import {
  Filter,
  Search,
  MapPin,
  RotateCcw,
  Zap,
  EyeOff,
  Tag,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const NOTICE_CATEGORIES = [
  { value: "announcement", label: "Public Announcement", icon: "📢" },
  { value: "emergency", label: "Emergency Alert", icon: "🚨" },
  { value: "tender", label: "Procurement & Tenders", icon: "📋" },
  { value: "event", label: "City Events", icon: "🎉" },
  { value: "vacancy", label: "Job Vacancies", icon: "💼" },
];

export default function NoticeFilters({ onFilterChange, initialFilters, wards }: any) {
  const [filters, setFilters] = useState({
    search: "",
    ward: "",
    type: "",
    unreadOnly: false,
    urgentOnly: false,
    ...initialFilters,
  });

  const handleUpdate = (updates: Partial<typeof filters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const reset = { search: "", ward: "", type: "", unreadOnly: false, urgentOnly: false };
    setFilters(reset);
    onFilterChange(reset);
  };

  const activeFiltersCount = [
    filters.search, filters.ward, filters.type, filters.unreadOnly, filters.urgentOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-xs">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">
              Filters
            </h2>
            {activeFiltersCount > 0 && (
              <p className="text-xs text-muted-foreground font-medium">
                {activeFiltersCount} active filter{activeFiltersCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase text-muted-foreground tracking-wider ml-1">
            Search
          </Label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              placeholder="Title, ID, or keywords..."
              value={filters.search}
              onChange={(e) => handleUpdate({ search: e.target.value })}
              className="pl-11 pr-4 bg-background border-border rounded-xl h-11 text-sm font-medium focus-visible:ring-ring transition-all"
            />
          </div>
        </div>

        {/* Ward Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase text-muted-foreground tracking-wider ml-1">
            Ward
          </Label>
          <Select
            value={filters.ward || "all"}
            onValueChange={(v) => handleUpdate({ ward: v === "all" ? "" : v })}
          >
            <SelectTrigger className="bg-background border-border rounded-xl h-11 font-medium hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary" />
                <SelectValue placeholder="All Wards" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border max-h-[300px]">
              <SelectItem value="all" className="font-medium rounded-lg">
                🏛️ All Wards
              </SelectItem>
              {wards?.map((w: any) => (
                <SelectItem key={w.id} value={w.ward_number.toString()} className="rounded-lg">
                  Ward {w.ward_number.toString().padStart(2, "0")} — {w.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase text-muted-foreground tracking-wider ml-1">
            Category
          </Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(v) => handleUpdate({ type: v === "all" ? "" : v })}
          >
            <SelectTrigger className="bg-background border-border rounded-xl h-11 font-medium hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-secondary" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="all" className="font-medium rounded-lg">
                📁 All Categories
              </SelectItem>
              {NOTICE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="rounded-lg">
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Toggles */}
        <div className="pt-2 space-y-2">
          <Label className="text-xs font-medium uppercase text-muted-foreground tracking-wider ml-1">
            Quick Filters
          </Label>
          <div className="bg-muted/30 rounded-xl p-2 border border-border/50 space-y-1.5">
            <ToggleRow
              icon={EyeOff}
              label="Unread Only"
              description="Show only new bulletins"
              checked={filters.unreadOnly}
              onChange={(v: boolean) => handleUpdate({ unreadOnly: v })}
            />
            <div className="h-px bg-border/50 mx-3" />
            <ToggleRow
              icon={Zap}
              label="Urgent Priority"
              description="Critical notices first"
              checked={filters.urgentOnly}
              onChange={(v: boolean) => handleUpdate({ urgentOnly: v })}
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="px-5 py-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Pro Tip</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Urgent notices are highlighted with a red accent for immediate attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: any) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer group",
        checked
          ? "bg-background shadow-xs border border-border/50"
          : "hover:bg-background/50 text-muted-foreground"
      )}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-xl transition-colors duration-200",
            checked
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className={cn("text-sm font-medium transition-colors", checked ? "text-foreground" : "text-muted-foreground")}>
            {label}
          </p>
          <p className="text-xs text-muted-foreground/70">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}