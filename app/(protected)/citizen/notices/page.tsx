"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { noticesService } from "@/lib/supabase/queries/notices";
import NoticesList from "./_components/NoticesList";
import NoticeFilters from "./_components/NoticeFilters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom Stat Card component matching Machhapuchhre Modern "Stone Card"
function StatCard({ icon: Icon, label, value, colorVar }: any) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <div className="stone-card p-6 relative overflow-hidden group">
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{ background: `rgb(var(${colorVar}))` }}
        />
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              {label}
            </p>
            <p className="text-3xl font-mono font-bold text-foreground tracking-tight">
              {value.toLocaleString()}
            </p>
          </div>
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border border-white/20"
            style={{
              background: `linear-gradient(135deg, rgb(var(${colorVar}) / 0.1), rgb(var(${colorVar}) / 0.2))`,
              color: `rgb(var(${colorVar}))`,
            }}
          >
            <Icon className="h-6 w-6" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: undefined as string | undefined,
    ward: undefined as string | undefined,
    type: undefined as string | undefined,
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    unreadOnly: false,
  });

  const limit = 10;
  const offset = (page - 1) * limit;

  const fetchNotices = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setIsLoading(true);
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
      } catch (error: any) {
        toast.error("Connection Error", {
          description: "Unable to sync with Smart City servers.",
        });
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    [page, filters, limit, offset]
  );

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleRefresh = () => {
    toast.promise(fetchNotices(true), {
      loading: "Syncing with municipal servers...",
      success: "Notice board updated",
      error: "Sync failed",
    });
  };

  const handleFilterChange = (newFilters: any) => {
    const safeFilters = {
      ...newFilters,
      dateFrom: newFilters.dateFrom ? new Date(newFilters.dateFrom) : undefined,
      dateTo: newFilters.dateTo ? new Date(newFilters.dateTo) : undefined,
    };
    setFilters((prev) => ({ ...prev, ...safeFilters }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--neutral-stone))] relative overflow-x-hidden font-sans">
      {/* --- Ambient Background Effects (Phewa & Nature) --- */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 bg-[rgb(var(--accent-nature)/0.3)] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-30 bg-[rgb(var(--primary-brand)/0.2)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
        {/* --- Header Section --- */}
        <header className="mb-12 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/40 backdrop-blur-sm text-[rgb(var(--primary-brand))] text-[10px] font-black uppercase tracking-widest shadow-sm">
                <ShieldCheck className="h-3 w-3" />
                Pokhara Metropolitan City
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-[rgb(var(--text-ink))] tracking-tight">
                Official{" "}
                <span className="text-[rgb(var(--primary-brand))]">
                  Notices
                </span>
              </h1>
              <p className="text-[rgb(var(--neutral-stone-600))] text-lg max-w-2xl leading-relaxed">
                Stay informed with the latest municipal announcements, tenders,
                and emergency alerts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-12 px-6 rounded-2xl bg-white/80 border-[rgb(var(--neutral-stone-200))] text-[rgb(var(--text-ink))] hover:bg-white shadow-sm hover:shadow-md transition-all font-bold"
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
                />
                Sync
              </Button>
              {unreadCount > 0 && (
                <div className="h-12 px-6 rounded-2xl bg-[rgb(var(--highlight-tech))] text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 animate-in zoom-in">
                  <Bell className="h-4 w-4 animate-[bell-swing_1s_ease-in-out_infinite]" />
                  {unreadCount} New
                </div>
              )}
            </div>
          </div>

          {/* --- Stats Grid --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              icon={Info}
              label="Total Notices"
              value={total}
              colorVar="--primary-brand"
            />
            <StatCard
              icon={Sparkles}
              label="Unread Alerts"
              value={unreadCount}
              colorVar="--highlight-tech"
            />
            <StatCard
              icon={TrendingUp}
              label="This Month"
              value={notices.length}
              colorVar="--accent-nature"
            />
          </div>
        </header>

        {/* --- Main Content Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-3 lg:sticky lg:top-8 z-20">
            <NoticeFilters onFilterChange={handleFilterChange} />
          </aside>

          <main className="lg:col-span-9 min-h-[500px]">
            <NoticesList
              notices={notices}
              isLoading={isLoading}
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}