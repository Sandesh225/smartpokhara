"use client";

import { useState } from "react";
import { 
  RefreshCw, 
  SlidersHorizontal, 
  SearchX, 
  Sparkles,
  Layers,
  Bell,
  TrendingUp,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import NoticesList from "./NoticesList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import NoticeFilters from "./NoticeFilters";

interface NoticesContentProps {
  initialNotices: any[];
  initialTotal: number;
  initialUnreadCount: number;
}

export default function NoticesContent({
  initialNotices,
  initialTotal,
  initialUnreadCount,
}: NoticesContentProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: undefined as string | undefined,
    ward: undefined as string | undefined,
    type: undefined as string | undefined,
    unreadOnly: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Notices updated");
    }, 1000);
  };

  const activeFiltersCount = [
    filters.search, 
    filters.ward, 
    filters.type, 
    filters.unreadOnly
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Layers} label="All Announcements" value={initialTotal} delay={0.05} />
        <StatCard icon={Bell} label="New for You" value={initialUnreadCount} delay={0.1} />
        <StatCard icon={TrendingUp} label="Showing" value={initialNotices.length} delay={0.15} />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-card border border-border rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search notices..."
            value={filters.search || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-11 px-5 rounded-xl border-border font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98]",
              showFilters && "bg-primary/10 border-primary/20 text-primary"
            )}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-black">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-11 px-5 rounded-xl border-border font-bold text-xs uppercase tracking-widest active:scale-[0.98]"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin text-primary")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {showFilters && (
          <aside className="lg:col-span-3 animate-fade-in">
            <NoticeFilters
              onFilterChange={(f: any) => {
                setFilters((p) => ({ ...p, ...f }));
                setPage(1);
              }}
            />
          </aside>
        )}

        <div className={cn(showFilters ? "lg:col-span-9" : "lg:col-span-12")}>
          <NoticesList
            notices={initialNotices}
            isLoading={false}
            total={initialTotal}
            page={page}
            limit={10}
            onPageChange={setPage}
          />

          {initialNotices.length === 0 && (
            <div className="animate-fade-in py-12">
              <Card className="border-2 border-dashed border-border overflow-hidden rounded-2xl bg-muted/5">
                <CardContent className="py-16 flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                    <SearchX className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">No Notices Found</h3>
                    <p className="text-muted-foreground max-w-sm text-sm">
                      We couldn&apos;t find any announcements matching your criteria.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: undefined,
                      ward: undefined,
                      type: undefined,
                      unreadOnly: false,
                    })}
                    className="mt-2 rounded-xl font-bold text-xs uppercase tracking-widest border-border"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                    Reset All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delay = 0 }: any) {
  return (
    <div
      className="group animate-fade-in"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      <Card className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
              <Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">
                {label}
              </p>
              <h4 className="text-2xl font-black text-foreground tabular-nums">
                {value}
              </h4>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
