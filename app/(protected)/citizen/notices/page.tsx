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
  Sparkles,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { noticesService } from "@/lib/supabase/queries/notices";
import NoticesList from "./_components/NoticesList";
import NoticeFilters from "./_components/NoticeFilters";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Card className="surface-elevated border-2 border-border hover:border-primary/40 transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            >
              <Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </motion.div>
            <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse" />
          </div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-3xl lg:text-4xl font-black text-foreground tabular-nums">
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
    <div className="min-h-screen bg-layer-base relative">
      {/* ✅ Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 dark:opacity-20" />

      <div className="relative z-10 container-gov space-y-8 pb-16 pt-6 animate-fade-in">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass border-2 border-border rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl"
                >
                  <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                    Public Notices
                  </h1>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Official metropolitan announcements and bulletins
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-4 py-2 text-sm font-bold border-2">
                  <Bell className="w-4 h-4 mr-2" />
                  {unreadCount} Unread
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm font-bold border-2">
                  <Layers className="w-4 h-4 mr-2" />
                  {total} Total
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm font-bold border-2">
                  <Eye className="w-4 h-4 mr-2" />
                  {notices.length} Visible
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.promise(fetchNotices(true), {
                      loading: "Refreshing notices...",
                      success: "Notices updated successfully",
                      error: "Refresh failed",
                    })
                  }
                  disabled={isLoading}
                  className="h-11 px-5 border-2 rounded-xl font-bold"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4 mr-2 transition-transform",
                      isLoading && "animate-spin"
                    )}
                  />
                  Refresh
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-11 px-5 rounded-xl font-bold border-2",
                    showFilters && "shadow-lg"
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2 h-6 min-w-[1.5rem] px-2 flex items-center justify-center rounded-full bg-background text-xs font-black"
                    >
                      {activeFiltersCount}
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatCard icon={Layers} label="Total Notices" value={total} delay={0.1} />
          <StatCard icon={Bell} label="Unread" value={unreadCount} delay={0.2} />
          <StatCard icon={TrendingUp} label="Displaying" value={notices.length} delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <AnimatePresence mode="wait">
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="lg:col-span-3"
              >
                <NoticeFilters
                  onFilterChange={(f: any) => {
                    setFilters((p) => ({ ...p, ...f }));
                    setPage(1);
                  }}
                />
              </motion.aside>
            )}
          </AnimatePresence>

          <motion.main
            layout
            transition={{ duration: 0.3 }}
            className={cn(showFilters ? "lg:col-span-9" : "lg:col-span-12")}
          >
            <NoticesList
              notices={notices}
              isLoading={isLoading}
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
            />

            {!isLoading && notices.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-2 border-dashed border-border mt-12 overflow-hidden">
                  <CardContent className="py-20 flex flex-col items-center text-center space-y-6">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center"
                    >
                      <SearchX className="w-10 h-10 text-muted-foreground/50" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-foreground">
                        No Notices Found
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        Try adjusting or clearing your filters to see more results.
                      </p>
                    </div>
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
                      className="mt-4 rounded-xl font-bold border-2"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Reset All Filters
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}