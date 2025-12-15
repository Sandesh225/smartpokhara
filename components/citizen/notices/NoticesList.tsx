"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import { toast } from "sonner";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [sortBy, setSortBy] = useState("published_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // keep input synced with parent
  useEffect(() => setSearchTerm(currentSearch), [currentSearch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && searchTerm !== currentSearch) {
        onSearchChange(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch, onSearchChange]);

  // Parse sort from URL (if you control via query params)
  useEffect(() => {
    const sortByParam = searchParams.get("sort_by");
    const sortOrderParam = searchParams.get("sort_order");

    if (sortByParam) setSortBy(sortByParam);
    if (sortOrderParam === "ASC" || sortOrderParam === "DESC") setSortOrder(sortOrderParam);
  }, [searchParams]);

  const handleSortBy = (newSortBy: string) => {
    const newOrder: "ASC" | "DESC" =
      newSortBy === sortBy && sortOrder === "DESC" ? "ASC" : "DESC";

    setSortBy(newSortBy);
    setSortOrder(newOrder);
    onSortChange?.(newSortBy, newOrder);

    toast.success("Sorting updated", {
      description: `${newSortBy.replace(/_/g, " ")} • ${newOrder}`,
      duration: 1800,
    });
  };

  const toggleSortOrder = () => {
    const newOrder: "ASC" | "DESC" = sortOrder === "DESC" ? "ASC" : "DESC";
    setSortOrder(newOrder);
    onSortChange?.(sortBy, newOrder);

    toast.success("Sorting updated", {
      description: `${sortBy.replace(/_/g, " ")} • ${newOrder}`,
      duration: 1800,
    });
  };

  const setMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    toast.message(mode === "grid" ? "Grid view" : "List view", { duration: 1200 });
  };

  const unreadCount = useMemo(
    () => notices.filter((n) => !n.is_read).length,
    [notices]
  );

  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | "...")[] = [];
    const pages: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      }
    }

    let last: number | undefined;
    for (const p of pages) {
      if (last) {
        if (p - last === 2) range.push(last + 1);
        else if (p - last > 2) range.push("...");
      }
      range.push(p);
      last = p;
    }

    return range;
  };

  // Premium Skeleton
  if (isLoading && notices.length === 0) {
    return (
      <Card className="border-2 border-slate-200 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 opacity-60 pointer-events-none" />
        <CardHeader className="relative border-b border-slate-200 bg-white/70 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Bell className="h-5 w-5 text-blue-600" />
            Notices
          </CardTitle>
        </CardHeader>
        <CardContent className="relative p-6 space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl border-2 border-slate-200 bg-white/70 shadow-sm space-y-3">
              <Skeleton className="h-5 w-2/3 bg-slate-200" />
              <Skeleton className="h-4 w-full bg-slate-100" />
              <Skeleton className="h-4 w-5/6 bg-slate-100" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-7 w-24 bg-slate-100" />
                <Skeleton className="h-7 w-20 bg-slate-100" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Premium Empty State
  if (!isLoading && notices.length === 0) {
    const hasQuery = !!searchParams.toString();
    return (
      <Card className="border-2 border-slate-200 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 opacity-60 pointer-events-none" />
        <CardHeader className="relative border-b border-slate-200 bg-white/70 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Bell className="h-5 w-5 text-blue-600" />
            Notices
          </CardTitle>
        </CardHeader>
        <CardContent className="relative p-8">
          <div className="py-10 text-center">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center shadow-sm">
              <AlertCircle className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">No notices found</h3>
            <p className="mt-2 text-slate-600 max-w-md mx-auto">
              {hasQuery ? "Try adjusting your filters or search terms." : "No notices are available right now."}
            </p>

            {hasQuery && (
              <Button
                variant="outline"
                className="mt-6 border-slate-300 hover:bg-white hover:border-blue-400 hover:text-blue-700 transition-all"
                onClick={() => router.push("/citizen/notices")}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 opacity-50 pointer-events-none" />

      <CardHeader className="relative bg-gradient-to-r from-white/85 to-blue-50/80 backdrop-blur-sm border-b-2 border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">
                All Notices <span className="text-slate-500 font-semibold">({total})</span>
              </span>

              {unreadCount > 0 && (
                <span className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full font-semibold shadow-md">
                  {unreadCount} unread
                </span>
              )}
            </CardTitle>

            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{from}-{to}</span> of{" "}
              <span className="font-semibold text-slate-900">{total}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("list")}
                className={cn(
                  "h-10 px-3 rounded-none hover:bg-slate-100",
                  viewMode === "list" && "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:text-white"
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("grid")}
                className={cn(
                  "h-10 px-3 rounded-none hover:bg-slate-100",
                  viewMode === "grid" && "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:text-white"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search notices…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[220px] sm:w-[280px] border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                aria-label="Search notices"
              />
            </div>

            {/* Filter Toggle */}
            {onToggleFilters && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  onToggleFilters();
                  toast.message(showFilters ? "Filters hidden" : "Filters shown", { duration: 1200 });
                }}
                className={cn(
                  "h-10 w-10 border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all",
                  showFilters && "bg-blue-50 border-blue-300 text-blue-700"
                )}
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={handleSortBy}>
              <SelectTrigger className="w-[200px] border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published_at">Date Published</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="notice_type">Notice Type</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              className="h-10 w-10 border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all"
              title={sortOrder === "DESC" ? "Descending" : "Ascending"}
              aria-label="Toggle sort order"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {isLoading && (
            <span className="text-sm text-slate-600">Updating…</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative p-6">
        <div
          className={cn(
            "gap-4",
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2" : "space-y-4"
          )}
        >
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              variant={viewMode === "grid" ? "compact" : "default"}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => page > 1 && onPageChange(page - 1)}
                disabled={page === 1}
                className="h-10 w-10 border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPaginationRange().map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-slate-500">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className={cn(
                      "h-10 w-10 border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all",
                      page === p &&
                        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                    )}
                    aria-label={`Go to page ${p}`}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => page < totalPages && onPageChange(page + 1)}
                disabled={page === totalPages}
                className="h-10 w-10 border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
