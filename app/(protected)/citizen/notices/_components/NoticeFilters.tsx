"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Search,
  MapPin,
  RotateCcw,
  Zap,
  EyeOff,
  Tag,
  ChevronDown,
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
  {
    value: "announcement",
    label: "Public Announcement",
    icon: "📢",
  },
  {
    value: "emergency",
    label: "Emergency Alert",
    icon: "🚨",
  },
  {
    value: "tender",
    label: "Procurement & Tenders",
    icon: "📋",
  },
  {
    value: "event",
    label: "City Events",
    icon: "🎉",
  },
  {
    value: "vacancy",
    label: "Job Vacancies",
    icon: "💼",
  },
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
    const reset = {
      search: "",
      ward: "",
      type: "",
      unreadOnly: false,
      urgentOnly: false,
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  const activeFiltersCount = [
    filters.search,
    filters.ward,
    filters.type,
    filters.unreadOnly,
    filters.urgentOnly,
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary shadow-sm"
          >
            <Filter className="w-5 h-5" />
          </motion.div>
          <div>
            <h2 className="font-black text-base uppercase tracking-tight text-foreground">
              Filter Registry
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
            className="h-9 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <div className="glass p-6 rounded-[2rem] border border-border/50 dark:border-border shadow-xl space-y-6">
        {/* Search Input */}
        <div className="space-y-3">
          <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider ml-1">
            Search Query
          </Label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              placeholder="Title, ID, or keywords..."
              value={filters.search}
              onChange={(e) => handleUpdate({ search: e.target.value })}
              className="pl-11 pr-4 bg-background dark:bg-background border-border dark:border-border rounded-2xl h-12 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Categorization Section */}
        <div className="space-y-5 pt-2">
          {/* Ward Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider ml-1">
              Jurisdiction
            </Label>
            <Select
              value={filters.ward || "all"}
              onValueChange={(v) => handleUpdate({ ward: v === "all" ? "" : v })}
            >
              <SelectTrigger className="bg-background dark:bg-background border-border dark:border-border rounded-2xl h-12 font-bold hover:border-primary/50 transition-all">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-primary dark:text-primary" />
                  <SelectValue placeholder="Metropolitan Wide" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border dark:border-border max-h-[300px]">
                <SelectItem value="all" className="font-bold rounded-xl">
                  🏛️ Metropolitan Wide
                </SelectItem>
                {wards?.map((w: any) => (
                  <SelectItem
                    key={w.id}
                    value={w.ward_number.toString()}
                    className="rounded-xl"
                  >
                    <span className="font-medium">
                      Ward {w.ward_number.toString().padStart(2, "0")}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      — {w.name_en}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider ml-1">
              Bulletin Type
            </Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(v) => handleUpdate({ type: v === "all" ? "" : v })}
            >
              <SelectTrigger className="bg-background dark:bg-background border-border dark:border-border rounded-2xl h-12 font-bold hover:border-primary/50 transition-all">
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-secondary dark:text-secondary" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border dark:border-border">
                <SelectItem value="all" className="font-bold rounded-xl">
                  📁 All Categories
                </SelectItem>
                {NOTICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="rounded-xl">
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="pt-4 space-y-3">
          <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider ml-1">
            Quick Filters
          </Label>
          <div className="bg-muted/30 dark:bg-muted/20 rounded-2xl p-2 border border-border/50 dark:border-border space-y-1.5">
            <ToggleRow
              icon={EyeOff}
              label="Unread Only"
              description="Show only new bulletins"
              checked={filters.unreadOnly}
              onChange={(v: boolean) => handleUpdate({ unreadOnly: v })}
            />
            <div className="h-px bg-border/50 dark:bg-border mx-3" />
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-5 py-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30"
      >
        <div className="flex gap-3">
          <div className="mt-0.5">
            <div className="h-6 w-6 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary dark:text-primary" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-foreground mb-1">Pro Tip</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Urgent notices are highlighted with a red accent and pulse
              animation for immediate attention.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer group",
        checked
          ? "bg-background dark:bg-background shadow-sm border border-border/50 dark:border-border"
          : "hover:bg-background/50 dark:hover:bg-background/50"
      )}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: checked ? 1 : 0.9,
            backgroundColor: checked
              ? "rgb(var(--foreground))"
              : "rgb(var(--muted))",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "p-2 rounded-xl transition-colors",
            checked
              ? "text-background dark:text-background"
              : "text-muted-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
        <div>
          <p
            className={cn(
              "text-sm font-bold transition-colors",
              checked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </p>
          <p className="text-xs text-muted-foreground/70">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary"
      />
    </motion.div>
  );
}