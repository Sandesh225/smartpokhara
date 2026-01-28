"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="border-2 border-border overflow-hidden rounded-3xl shadow-xl">
        <CardHeader className="pb-6 border-b-2 border-border bg-gradient-to-br from-muted/30 to-transparent">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl"
              >
                <Bell className="h-7 w-7 text-white" strokeWidth={2.5} />
              </motion.div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-black text-2xl text-foreground tracking-tight">
                    Official Registry
                  </h2>
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black rounded-full animate-pulse px-3 py-1 shadow-lg">
                          {unreadCount} New
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Displaying {from}—{to} of {total} Bulletins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted p-1.5 rounded-2xl border-2 border-border shadow-sm">
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[240px] rounded-2xl border-2 border-border bg-background font-bold h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-2 border-border">
                <SelectItem value="published_at">📅 Publication Date</SelectItem>
                <SelectItem value="title">🔤 Alphabetical</SelectItem>
                <SelectItem value="notice_type">📂 Category</SelectItem>
              </SelectContent>
            </Select>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="h-12 px-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/10 border-2"
                onClick={handleSortToggle}
              >
                <ArrowUpDown
                  className={cn("h-4 w-4 mr-2 transition-transform duration-300", sortOrder === "ASC" && "rotate-180")}
                />
                {sortOrder === "DESC" ? "Newest First" : "Oldest First"}
              </Button>
            </motion.div>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider ml-auto"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Updating...
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {notices.length === 0 ? (
            <EmptyRegistryState />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn("gap-6", viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col")}
              >
                {notices.map((notice, idx) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <NoticeCard notice={notice} variant={viewMode === "grid" ? "compact" : "default"} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t-2 border-border"
            >
              <div className="text-sm font-bold text-muted-foreground">
                Page <span className="text-primary font-black text-lg">{page}</span> of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <PaginationButton disabled={page === 1} onClick={() => onPageChange(page - 1)} icon={ChevronLeft} label="Previous" />
                <div className="flex items-center gap-1.5 bg-muted p-1.5 rounded-2xl border-2 border-border">
                  {getPageNumbers().map((pageNum, idx) =>
                    pageNum === "ellipsis" ? (
                      <div key={idx} className="h-10 w-10 flex items-center justify-center text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    ) : (
                      <motion.div key={pageNum} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={page === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => onPageChange(pageNum as number)}
                          className={cn(
                            "h-10 w-10 rounded-xl font-black text-sm transition-all",
                            page === pageNum
                              ? "bg-gradient-to-br from-primary to-secondary text-whiteshadow-xl scale-110"
                              : "text-muted-foreground hover:text-foreground hover:bg-background"
                          )}
                        >
                          {pageNum}
                        </Button>
                      </motion.div>
                    )
                  )}
                </div>
                <PaginationButton disabled={page === totalPages} onClick={() => onPageChange(page + 1)} icon={ChevronRight} label="Next" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ViewToggleButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={cn(
          "h-10 px-4 rounded-xl font-bold text-xs transition-all",
          active
            ? "bg-background text-primary shadow-md scale-105 border-2 border-primary/20"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </motion.div>
  );
}

function PaginationButton({ disabled, onClick, icon: Icon, label }: any) {
  return (
    <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onClick}
        className="rounded-2xl border-2 border-border h-11 px-5 bg-background hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-all"
      >
        <Icon className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </motion.div>
  );
}

function EmptyRegistryState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-24 flex flex-col items-center text-center space-y-6"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/40 border-2 border-dashed border-border"
      >
        <Inbox className="h-12 w-12" />
      </motion.div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-foreground">No Records Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Your current filter parameters don't match any active notices in our metropolitan registry.
        </p>
      </div>
    </motion.div>
  );
}

function NoticesLoadingState() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-border overflow-hidden rounded-3xl shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-muted/30 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-32 bg-muted/30 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 w-full rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}