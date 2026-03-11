"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  List,
  LayoutGrid,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import NoticeCard from "./NoticeCard";

interface NoticesListProps {
  notices: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function NoticesList({
  notices,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
}: NoticesListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState("published_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const unreadCount = useMemo(() => notices.filter((n) => !n.is_read).length, [notices]);

  const handleSortToggle = () =>
    setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC");

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading && notices.length === 0) return <NoticesLoadingState />;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border border-border overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                <Bell className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-bold text-xl text-foreground tracking-tight">
                    Official Notices
                  </h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-secondary text-secondary-foreground font-bold rounded-full px-2.5 py-0.5 text-xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Showing {from}–{to} of {total} bulletins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border">
              <ViewToggleButton
                active={viewMode === "list"}
                onClick={() => setViewMode("list")}
                icon={List}
                label="List"
              />
              <ViewToggleButton
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                icon={LayoutGrid}
                label="Grid"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-border bg-background font-medium h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="published_at">📅 Date</SelectItem>
                <SelectItem value="title">🔤 Title</SelectItem>
                <SelectItem value="notice_type">📂 Category</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl text-xs font-medium border-border hover:bg-muted transition-all duration-200 active:scale-[0.98]"
              onClick={handleSortToggle}
            >
              <ArrowUpDown
                className={cn("h-4 w-4 mr-2 transition-transform duration-200", sortOrder === "ASC" && "rotate-180")}
              />
              {sortOrder === "DESC" ? "Newest" : "Oldest"}
            </Button>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary ml-auto animate-fade-in">
                <Sparkles className="h-4 w-4 animate-spin" />
                Updating...
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {notices.length === 0 ? (
            <EmptyState />
          ) : (
            <div className={cn("gap-6", viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col")}>
              {notices.map((notice, idx) => (
                <div
                  key={notice.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <NoticeCard notice={notice} variant={viewMode === "grid" ? "compact" : "default"} />
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
              <div className="text-sm font-medium text-muted-foreground">
                Page <span className="text-primary font-bold">{page}</span> of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <PaginationButton disabled={page === 1} onClick={() => onPageChange(page - 1)} icon={ChevronLeft} label="Previous" />
                <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                  {getPageNumbers().map((pageNum, idx) =>
                    pageNum === "ellipsis" ? (
                      <div key={idx} className="h-9 w-9 flex items-center justify-center text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onPageChange(pageNum as number)}
                        className={cn(
                          "h-9 w-9 rounded-lg font-bold text-sm transition-all duration-200",
                          page === pageNum
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background"
                        )}
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>
                <PaginationButton disabled={page === totalPages} onClick={() => onPageChange(page + 1)} icon={ChevronRight} label="Next" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ViewToggleButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-9 px-3 rounded-lg font-medium text-xs transition-all duration-200",
        active
          ? "bg-background text-primary shadow-xs border border-primary/20"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 mr-1.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

function PaginationButton({ disabled, onClick, icon: Icon, label }: any) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border-border h-9 px-4 bg-background hover:bg-muted disabled:opacity-30 font-medium transition-all duration-200 active:scale-[0.98]"
    >
      <Icon className="h-4 w-4 sm:mr-1.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="py-20 flex flex-col items-center text-center space-y-4 animate-fade-in">
      <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/30 border-2 border-dashed border-border">
        <Inbox className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">No Notices Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm">
          Your current filters don't match any active notices.
        </p>
      </div>
    </div>
  );
}

function NoticesLoadingState() {
  return (
    <div className="space-y-6">
      <Card className="border border-border overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-28 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 w-full rounded-2xl bg-muted animate-pulse" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}