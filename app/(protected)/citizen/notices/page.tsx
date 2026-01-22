"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  RefreshCw,
  Layers,
  TrendingUp,
  ShieldCheck,
  SlidersHorizontal,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";

import { noticesService } from "@/lib/supabase/queries/notices";
import NoticesList from "./_components/NoticesList";
import NoticeFilters from "./_components/NoticeFilters";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ---------------------------------- */
/* Dashboard Stat Card                 */
/* ---------------------------------- */
function StatCard({ icon: Icon, label, value }: any) {
  return (
    <Card className="stone-card hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-5 flex flex-col gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl lg:text-3xl font-black text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- */
/* Notices Page                        */
/* ---------------------------------- */
export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: undefined as string | undefined,
    ward: undefined as string | undefined,
    type: undefined as string | undefined,
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    unreadOnly: false,
    urgentOnly: false,
  });

  const limit = 10;
  const offset = (page - 1) * limit;

  const fetchNotices = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);

        const [noticesData, unread] = await Promise.all([
          noticesService.getUserNotices({
            limit,
            offset,
            search: filters.search,
            wardId: filters.ward,
            noticeType: filters.type,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            unreadOnly: filters.unreadOnly,
          }),
          noticesService.getUnreadNoticeCount(),
        ]);

        setNotices(noticesData.notices);
        setTotal(noticesData.total);
        setUnreadCount(unread);
      } catch {
        toast.error("Failed to load notices");
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [filters, page]
  );

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const activeFiltersCount = [
    filters.search,
    filters.ward,
    filters.type,
    filters.unreadOnly,
    filters.urgentOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12 px-4 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="border-b border-border dark:border-border pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Public Notices
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {unreadCount} Unread
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {total} Total
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast.promise(fetchNotices(true), {
                  loading: "Refreshing notices...",
                  success: "Notices updated",
                  error: "Refresh failed",
                })
              }
              disabled={isLoading}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 mr-2 transition-transform",
                  isLoading && "animate-spin"
                )}
              />
              Refresh
            </Button>

            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-background text-xs font-black">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Total Notices" value={total} />
        <StatCard icon={Bell} label="Unread Notices" value={unreadCount} />
        <StatCard icon={TrendingUp} label="Visible" value={notices.length} />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="lg:col-span-3"
            >
              <NoticeFilters
                onFilterChange={(f) => {
                  setFilters((p) => ({ ...p, ...f }));
                  setPage(1);
                }}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <main className={cn(showFilters ? "lg:col-span-9" : "lg:col-span-12")}>
          <NoticesList
            notices={notices}
            isLoading={isLoading}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
          />

          {!isLoading && notices.length === 0 && (
            <Card className="stone-card mt-12 border-dashed flex flex-col items-center text-center py-16">
              <CardContent className="space-y-4">
                <SearchX className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-2xl font-black text-foreground">
                  No Notices Found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting or clearing your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      search: undefined,
                      ward: undefined,
                      type: undefined,
                      dateFrom: undefined,
                      dateTo: undefined,
                      unreadOnly: false,
                      urgentOnly: false,
                    })
                  }
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
