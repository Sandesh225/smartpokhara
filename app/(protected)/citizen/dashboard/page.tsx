"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  RefreshCw,
  Activity,
  Calendar,
  Sparkles,
  TrendingUp,
  Signal,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// Local Sub-components
import DashboardStats from "@/components/citizen/dashboard/DashboardStats";
import RecentComplaints from "@/components/citizen/dashboard/RecentComplaints";
import PendingBills from "@/components/citizen/dashboard/PendingBills";
import RecentNotices from "@/components/citizen/dashboard/RecentNotices";
import QuickActions from "@/components/citizen/dashboard/QuickActions";
import { cn } from "@/lib/utils";

export default function CitizenDashboard() {
  const router = useRouter();
  const supabase = createClient();

  // --- 1. UI & LIFE-CYCLE STATE ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // --- 2. DATA STATE ---
  const [dashboardData, setDashboardData] = useState({
    profile: { name: "", ward: null },
    complaints: [],
    bills: [],
    notices: [],
    stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    loading: true,
  });

  // --- 3. CLOCK LOGIC (Updates every minute) ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- 4. DATA FETCHING (Parallel Orchestration) ---
  const fetchDashboardState = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);

        // Perform all requests in parallel for maximum speed
        const [profileRes, complaintsRes, billsRes, noticesRes] =
          await Promise.all([
            supabase
              .from("user_profiles")
              .select("ward_id, full_name")
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("complaints")
              .select("*")
              .eq("citizen_id", user.id)
              .order("submitted_at", { ascending: false }),
            supabase
              .from("bills")
              .select("*")
              .eq("citizen_id", user.id)
              .eq("status", "pending"),
            supabase
              .from("notices")
              .select("*")
              .order("published_at", { ascending: false })
              .limit(5),
          ]);

        const complaintsList = complaintsRes.data || [];
        const stats = {
          total: complaintsList.length,
          open: complaintsList.filter((c) =>
            ["received", "under_review", "assigned", "reopened"].includes(
              c.status
            )
          ).length,
          inProgress: complaintsList.filter((c) => c.status === "in_progress")
            .length,
          resolved: complaintsList.filter((c) =>
            ["resolved", "closed"].includes(c.status)
          ).length,
        };

        setDashboardData({
          profile: {
            name: profileRes.data?.full_name?.split(" ")[0] || "Citizen",
            ward: profileRes.data?.ward_id,
          },
          complaints: complaintsList.slice(0, 5),
          bills: billsRes.data || [],
          notices: noticesRes.data || [],
          stats,
          loading: false,
        });

        if (isRefresh) toast.success("Registry Synchronized");
      } catch (e) {
        console.error("Dashboard Fetch Error", e);
        toast.error("Failed to connect to city servers");
      } finally {
        setIsRefreshing(false);
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    fetchDashboardState();
  }, [fetchDashboardState]);

  // --- 5. REAL-TIME SUBSCRIPTION ---
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`citizen-dashboard-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
          filter: `citizen_id=eq.${userId}`,
        },
        () => fetchDashboardState(true)
      )
      .subscribe((status) => setIsConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchDashboardState]);

  // Derived Values
  const activeIssues =
    dashboardData.stats.open + dashboardData.stats.inProgress;

  if (dashboardData.loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="container mx-auto px-4 py-8 space-y-10 max-w-7xl pb-24 animate-in fade-in duration-700">
        {/* --- HEADER SECTION --- */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 flex-1 min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight"
              >
                Namaste,
                {dashboardData.profile.name}
              </motion.h1>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {/* DYNAMIC MESSAGE: Active Issues Status */}
                <p className="font-bold text-blue-600 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  You have {activeIssues} active issue
                  {activeIssues !== 1 ? "s" : ""} being processed.
                </p>

                <Separator
                  orientation="vertical"
                  className="h-4 hidden sm:block bg-slate-200"
                />

                <span className="text-slate-500 font-medium uppercase tracking-widest text-[11px]">
                  Pokhara Metro • Ward {dashboardData.profile.ward || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* LIVE Badge */}
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-2 px-4 py-2 shadow-sm rounded-2xl"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-black uppercase tracking-widest text-[10px]">
                  Live
                </span>
              </Badge>

              <Separator
                orientation="vertical"
                className="h-8 hidden sm:block bg-slate-100 mx-1"
              />

              {/* DYNAMIC CLOCK & SYNC BUTTON */}
              <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-slate-100 px-4 py-2 shadow-sm">
                <span className="text-sm font-black text-slate-900 tabular-nums">
                  {format(currentTime, "HH:mm")}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                        onClick={() => fetchDashboardState(true)}
                        disabled={isRefreshing}
                      >
                        <RefreshCw
                          className={cn(
                            "h-4 w-4",
                            isRefreshing && "animate-spin"
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl font-bold">
                      Sync Registry
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Operational Highlight Banner */}
          <AnimatePresence>
            {activeIssues > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-0 shadow-2xl shadow-blue-900/10 bg-blue-600 rounded-[2.5rem] overflow-hidden text-white">
                  <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        <TrendingUp className="w-4 h-4" /> System Update
                      </div>
                      <h3 className="text-2xl font-bold">
                        Active Review in Progress
                      </h3>
                      <p className="text-blue-100/80 font-medium">
                        Ward officials and department staff are currently
                        reviewing your pending reports.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => router.push("/citizen/complaints")}
                      className="h-12 px-8 rounded-2xl bg-white text-blue-600 font-black hover:bg-blue-50 shadow-lg"
                    >
                      Track Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* --- STATS SECTION --- */}
        <DashboardStats
          totalComplaints={dashboardData.stats.total}
          openCount={dashboardData.stats.open}
          inProgressCount={dashboardData.stats.inProgress}
          resolvedCount={dashboardData.stats.resolved}
          onStatClick={(filter) =>
            router.push(`/citizen/complaints?status=${filter}`)
          }
        />

        {/* --- QUICK ACTIONS --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Direct Services
            </h2>
          </div>
          <QuickActions
            complaintsCount={dashboardData.stats.total}
            pendingBillsCount={dashboardData.bills.length}
            noticesCount={dashboardData.notices.length}
          />
        </section>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Activity Lists */}
            <RecentComplaints complaints={dashboardData.complaints} />

            <div className="space-y-4">
              <PendingBills bills={dashboardData.bills} />
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Payments processed via Secure Metropolitan Gateway
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            {/* Contextual Sidebar */}
            <RecentNotices
              notices={dashboardData.notices}
              wardNumber={dashboardData.profile.ward}
            />

            {/* Premium Emergency Hotline Card */}
            <Card className="border-0 shadow-2xl rounded-[3rem] bg-white overflow-hidden ring-1 ring-slate-900/5 group">
              <CardHeader className="bg-red-600 text-white p-10 pb-6 transition-colors group-hover:bg-red-700">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Signal className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black leading-none">
                      Emergency
                    </CardTitle>
                    <CardDescription className="text-red-100 font-bold text-[10px] uppercase tracking-widest mt-2">
                      Pokhara Response Hub
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-50">
                {[
                  { label: "District Police", n: "100", i: "🚔" },
                  { label: "City Ambulance", n: "102", i: "🚑" },
                  { label: "Fire Services", n: "101", i: "🚒" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-6 flex items-center justify-between hover:bg-red-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{item.i}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                          Available 24/7
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${item.n}`}
                      className="h-11 px-5 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      {item.n}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

// --- LOADING SKELETON ---
function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-10 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-14 w-80 rounded-2xl" />
        <Skeleton className="h-6 w-96 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-[400px] rounded-[3rem]" />
          <Skeleton className="h-[300px] rounded-[3rem]" />
        </div>
        <Skeleton className="h-[700px] rounded-[3rem]" />
      </div>
    </div>
  );
}