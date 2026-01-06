"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner"; // Switched to Sonner

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import NoticeCard from "./NoticeCard";
import {
  Bell,
  Search,
  Filter,
  AlertCircle,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  Badge,
} from "lucide-react";

interface NoticesListProps {
  notices: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange?: (search: string) => void;
  onSortChange?: (sortBy: string, sortOrder: "ASC" | "DESC") => void;
  currentSearch?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export default function NoticesList({
  notices,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onSearchChange,
  onSortChange,
  currentSearch = "",
  showFilters = false,
  onToggleFilters,
}: NoticesListProps) {
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [sortBy, setSortBy] = useState("published_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  useEffect(() => setSearchTerm(currentSearch), [currentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && searchTerm !== currentSearch) {
        onSearchChange(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch, onSearchChange]);

  useEffect(() => {
    const sortByParam = searchParams.get("sort_by");
    const sortOrderParam = searchParams.get("sort_order");
    if (sortByParam) setSortBy(sortByParam);
    if (sortOrderParam === "ASC" || sortOrderParam === "DESC")
      setSortOrder(sortOrderParam);
  }, [searchParams]);

  const handleSortBy = (newSortBy: string) => {
    const newOrder: "ASC" | "DESC" =
      newSortBy === sortBy && sortOrder === "DESC" ? "ASC" : "DESC";
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    onSortChange?.(newSortBy, newOrder);

    toast.success("Sorting updated", {
      description: `${newSortBy.replace(/_/g, " ")} set to ${newOrder}`,
    });
  };

  const toggleSortOrder = () => {
    const newOrder: "ASC" | "DESC" = sortOrder === "DESC" ? "ASC" : "DESC";
    setSortOrder(newOrder);
    onSortChange?.(sortBy, newOrder);
    toast.info(
      `Ordering: ${newOrder === "ASC" ? "Oldest first" : "Newest first"}`
    );
  };

  const setMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    toast.info(`${mode.charAt(0).toUpperCase() + mode.slice(1)} view enabled`);
  };

  const unreadCount = useMemo(
    () => notices.filter((n) => !n.is_read).length,
    [notices]
  );

  const getPaginationRange = () => {
    const delta = 1;
    const range: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  if (isLoading && notices.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Header & Controls */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white/80 backdrop-blur-xl ring-1 ring-slate-200 overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Bell className="h-5 w-5" />
                </div>
                <span className="font-bold text-2xl tracking-tight">
                  Active Notices
                </span>
                {unreadCount > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 rounded-full px-3 py-1 font-bold animate-pulse">
                    {unreadCount} New
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-slate-500 font-medium ml-1">
                Showing{" "}
                <span className="text-slate-900">
                  {from}-{to}
                </span>{" "}
                of <span className="text-slate-900">{total}</span> publications
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* View Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("list")}
                  className={cn(
                    "h-9 px-3 rounded-lg transition-all",
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("grid")}
                  className={cn(
                    "h-9 px-3 rounded-lg transition-all",
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Filter keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px] sm:w-[240px] rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-50 transition-all bg-white"
                />
              </div>

              {onToggleFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleFilters}
                  className={cn(
                    "rounded-xl border-slate-200 transition-all",
                    showFilters && "bg-blue-50 border-blue-200 text-blue-600"
                  )}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={handleSortBy}>
                <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="published_at">Date Published</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="notice_type">Notice Type</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                className="rounded-xl border-slate-200 bg-white hover:bg-blue-50"
              >
                <ArrowUpDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    sortOrder === "ASC" && "rotate-180"
                  )}
                />
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest animate-pulse">
                <Sparkles className="h-3 w-3" /> Syncing Board
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "gap-4",
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2"
                  : "flex flex-col"
              )}
            >
              {notices.map((notice, idx) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <NoticeCard
                    notice={notice}
                    variant={viewMode === "grid" ? "compact" : "default"}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-slate-50">
              <span className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-900 font-bold">{page}</span> of{" "}
                {totalPages}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-xl border-slate-200 h-10 w-10 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-2">
                  {getPaginationRange().map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`sep-${i}`}
                        className="px-2 text-slate-300 font-bold"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${p}`}
                        variant={page === p ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onPageChange(p as number)}
                        className={cn(
                          "h-10 w-10 rounded-xl font-bold",
                          page === p
                            ? "bg-blue-600 shadow-lg shadow-blue-100"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {p}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-xl border-slate-200 h-10 w-10 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}