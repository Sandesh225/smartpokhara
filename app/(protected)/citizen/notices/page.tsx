"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bell, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { noticesService } from "@/lib/supabase/queries/notices";
import NoticesList from "@/components/citizen/notices/NoticesList";
import NoticeFilters from "@/components/citizen/notices/NoticeFilters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { toast } from "sonner";

function StatCard({ icon: Icon, label, value, gradient, iconBg }: any) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 opacity-5 ${gradient}`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {value.toLocaleString()}
            </p>
          </div>
          <div
            className={`${iconBg} h-12 w-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NoticesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [notices, setNotices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || undefined;
  const ward = searchParams.get('ward') || undefined;
  const type = searchParams.get('type') || undefined;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  
  const limit = 20;
  const offset = (page - 1) * limit;

  const fetchNotices = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const noticesData = await noticesService.getUserNotices({
        limit,
        offset,
        search,
        wardId: ward,
        noticeType: type,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        unreadOnly,
      });
      
      const unread = await noticesService.getUnreadNoticeCount();
      
      setNotices(noticesData.notices);
      setTotal(noticesData.total);
      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices', {
        description: 'Please try again later',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, ward, type, dateFrom, dateTo, unreadOnly, limit, offset]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleFilterChange = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    newParams.set('page', '1');
    router.push(`?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRefresh = () => {
    fetchNotices();
    toast.success('Notices refreshed', {
      duration: 2000,
    });
  };

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                Notices & Announcements
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                Stay updated with important notices from Pokhara Metropolitan City
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2 border-slate-300 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all duration-200 shadow-sm"
                aria-label="Refresh notices"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              {unreadCount > 0 && (
                <Badge className="gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 shadow-lg hover:shadow-xl transition-all animate-pulse">
                  <Bell className="h-4 w-4" />
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              icon={Bell}
              label="Total Notices"
              value={total}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Sparkles}
              label="Unread"
              value={unreadCount}
              gradient="bg-gradient-to-br from-orange-500 to-orange-600"
              iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
            />
            <StatCard
              icon={TrendingUp}
              label="This Month"
              value={notices.filter(n => {
                const publishedDate = new Date(n.published_at);
                const now = new Date();
                return publishedDate.getMonth() === now.getMonth() && 
                       publishedDate.getFullYear() === now.getFullYear();
              }).length}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-6">
              <NoticeFilters
                onFilterChange={handleFilterChange}
                initialFilters={{
                  search: search || '',
                  ward: ward || '',
                  type: type || '',
                  dateFrom: dateFrom || '',
                  dateTo: dateTo || '',
                  unreadOnly,
                  urgentOnly: false,
                }}
              />
            </div>
          </aside>

          <main className="lg:col-span-9">
            <NoticesList
              notices={notices}
              isLoading={isLoading}
              total={total}
              page={page}
              limit={limit}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}