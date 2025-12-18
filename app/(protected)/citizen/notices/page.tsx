"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bell,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Info,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { noticesService } from "@/lib/supabase/queries/notices";
import NoticesList from "@/components/citizen/notices/NoticesList";
import NoticeFilters from "@/components/citizen/notices/NoticeFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, gradient }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden border-0 shadow-2xl shadow-slate-200/50 rounded-[2rem] bg-white ring-1 ring-slate-900/5 group">
        <div
          className={cn(
            "absolute inset-0 opacity-[0.03] bg-gradient-to-br transition-opacity group-hover:opacity-[0.07]",
            gradient
          )}
        />
        <CardContent className="p-7 relative flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {label}
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {value.toLocaleString()}
            </p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-50 to-white shadow-xl shadow-blue-900/5 flex items-center justify-center border border-slate-100 transition-transform group-hover:scale-110">
            <Icon className="h-7 w-7 text-blue-600" strokeWidth={2.5} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NoticesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notices, setNotices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || undefined;
  const ward = searchParams.get("ward") || undefined;
  const type = searchParams.get("type") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const limit = 20;
  const offset = (page - 1) * limit;

  const fetchNotices = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setIsLoading(true);
        const [noticesData, unread] = await Promise.all([
          noticesService.getUserNotices({
            limit,
            offset,
            search,
            wardId: ward,
            noticeType: type,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            unreadOnly,
          }),
          noticesService.getUnreadNoticeCount(),
        ]);

        setNotices(noticesData.notices);
        setTotal(noticesData.total);
        setUnreadCount(unread);
      } catch (error: any) {
        toast.error("Sync Error", {
          description: "Notice board couldn't be updated.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [page, search, ward, type, dateFrom, dateTo, unreadOnly, limit, offset]
  );

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleRefresh = () => {
    toast.promise(fetchNotices(true), {
      loading: "Refreshing board...",
      success: "Board synchronized",
      error: "Sync failed",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl relative z-10">
        <header className="mb-14 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/5 border border-blue-600/10 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3.5 w-3.5" /> Citizen Portal
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none">
                Official{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Notices
                </span>
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
                Critical updates and community announcements from Pokhara
                Metropolitan City.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-12 px-6 rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm font-bold text-slate-700 hover:bg-white transition-all active:scale-95"
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
                />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <div className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/25 animate-in zoom-in">
                  <Bell className="h-4 w-4" />
                  {unreadCount} New Alerts
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={Bell}
              label="Total Board"
              value={total}
              gradient="from-blue-600 to-indigo-700"
            />
            <StatCard
              icon={Sparkles}
              label="Unread"
              value={unreadCount}
              gradient="from-orange-500 to-red-600"
            />
            <StatCard
              icon={TrendingUp}
              label="This Month"
              value={notices.length}
              gradient="from-emerald-500 to-teal-700"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28">
            <NoticeFilters
              onFilterChange={(f) => {
                const params = new URLSearchParams(searchParams.toString());
                // Filter logic...
                router.push(`?${params.toString()}`);
              }}
            />
          </aside>

          {/* Notices List Area */}
          <main className="lg:col-span-9">
            <NoticesList
              notices={notices}
              isLoading={isLoading}
              total={total}
              page={page}
              limit={limit}
              onPageChange={(p) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", p.toString());
                router.push(`?${params.toString()}`);
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}