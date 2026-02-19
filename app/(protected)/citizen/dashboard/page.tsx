"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  RefreshCw,
  Activity,
  Loader2,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Sun,
  Moon,
  CloudSun,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import DashboardStats from "./_components/DashboardStats";
import QuickActions from "./_components/QuickActions";
import RecentComplaints from "./_components/RecentComplaints";
import RecentNotices from "./_components/RecentNotices";
import PendingBills from "./_components/PendingBills";

interface DashboardState {
  profile: {
    name: string;
    wardNumber: number | null;
    wardName: string;
    wardId: string | null;
  };
  complaints: any[];
  bills: any[];
  notices: any[];
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  loading: boolean;
  error: string | null;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardState>({
    profile: { name: "", wardNumber: null, wardName: "", wardId: null },
    complaints: [],
    bills: [],
    notices: [],
    stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    loading: true,
    error: null,
  });

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return (
        <div className="flex items-center gap-3">
          <Sun className="w-8 h-8 text-yellow-500 animate-pulse" />
          <span>Good Morning</span>
        </div>
      );
    }
    if (hour < 18) {
      return (
        <div className="flex items-center gap-3">
          <Sun className="w-8 h-8 text-orange-500" />
          <span>Good Afternoon</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3">
        <Moon className="w-8 h-8 text-indigo-400" />
        <span>Good Evening</span>
      </div>
    );
  }, [currentTime]);

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

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name, ward_id, ward:wards(ward_number, name)")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const wardId = profile?.ward_id ?? null;

        const [statsRes, complaintsRes, billsRes, noticesRes] =
          await Promise.all([
            supabase.rpc("rpc_get_dashboard_stats"),
            supabase
              .from("complaints")
              .select("*")
              .eq("citizen_id", user.id)
              .order("submitted_at", { ascending: false })
              .limit(5),
            supabase
              .from("bills")
              .select("*")
              .eq("citizen_id", user.id)
              .eq("status", "pending"),
            wardId
              ? supabase
                  .from("notices")
                  .select("*")
                  .or(`is_public.eq.true,ward_id.eq.${wardId}`)
                  .order("published_at", { ascending: false })
                  .limit(5)
              : supabase
                  .from("notices")
                  .select("*")
                  .eq("is_public", true)
                  .order("published_at", { ascending: false })
                  .limit(5),
          ]);

        if (statsRes.error) throw statsRes.error;
        if (complaintsRes.error) throw complaintsRes.error;
        if (billsRes.error) throw billsRes.error;
        if (noticesRes.error) throw noticesRes.error;

        const stats = statsRes.data?.complaints || {};

        const wardInfo = Array.isArray(profile?.ward) ? profile?.ward[0] : profile?.ward;

        setDashboardData({
          profile: {
            name: profile?.full_name?.split(" ")[0] || "Citizen",
            wardNumber: (wardInfo as any)?.ward_number ?? null,
            wardName: (wardInfo as any)?.name || "",
            wardId,
          },
          complaints: complaintsRes.data || [],
          bills: billsRes.data || [],
          notices: noticesRes.data || [],
          stats: {
            total: stats.total || 0,
            open: stats.open || 0,
            inProgress: stats.in_progress || 0,
            resolved: stats.resolved || 0,
          },
          loading: false,
          error: null,
        });

        if (isRefresh) toast.success("Dashboard refreshed successfully");
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        toast.error("Failed to load dashboard");
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      } finally {
        setIsRefreshing(false);
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    fetchDashboardState();
  }, [fetchDashboardState]);

  if (!isMounted || dashboardData.loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 animate-fade-in">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
            <Loader2
              className="w-10 h-10 animate-spin text-white"
              strokeWidth={2.5}
            />
          </div>
        </motion.div>
        <div className="text-center space-y-3">
          <h2 className="font-black text-2xl text-foreground tracking-tight">
            Loading Dashboard
          </h2>
          <p className="text-sm text-muted-foreground font-semibold">
            Preparing your personalized view
          </p>
          <Badge
            variant="outline"
            className="tracking-widest uppercase text-xs font-bold px-4 py-2 border-2"
          >
            <ShieldCheck className="w-3 h-3 mr-2" />
            Pokhara Citizen Portal
          </Badge>
        </div>
      </div>
    );
  }

  const activeCount = dashboardData.stats.open + dashboardData.stats.inProgress;
  const totalPendingAmount = dashboardData.bills.reduce(
    (sum, bill) => sum + (bill.total_amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="relative z-10 container-gov space-y-8 pb-16 pt-6 animate-fade-in">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/50 backdrop-blur-sm border-2 border-border rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                    <div className="flex flex-wrap items-center gap-x-3">
                      {greeting}, {dashboardData.profile.name}
                    </div>
                  </h1>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Welcome to your citizen dashboard
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-bold border-2"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {dashboardData.profile.wardName
                    ? `${dashboardData.profile.wardName} · Ward ${dashboardData.profile.wardNumber}`
                    : "Pokhara Metropolitan"}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-bold border-2"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(currentTime, "EEEE, MMMM do, yyyy")}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-mono font-bold border-2 tabular-nums"
                >
                  {format(currentTime, "hh:mm:ss a")}
                </Badge>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchDashboardState(true)}
              disabled={isRefreshing}
              className="flex items-center gap-3 px-6 py-3 border-2 border-border rounded-xl bg-card hover:bg-accent hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <RefreshCw
                className={cn("w-5 h-5", isRefreshing && "animate-spin")}
              />
              <span className="hidden sm:inline">Refresh Dashboard</span>
              <span className="sm:hidden">Refresh</span>
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: "2rem" }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center"
                      >
                        <Activity
                          className="w-7 h-7 text-primary"
                          strokeWidth={2.5}
                        />
                      </motion.div>
                      <div>
                        <h3 className="font-black text-xl text-foreground mb-1">
                          Active Requests
                        </h3>
                        <p className="text-sm text-muted-foreground font-semibold">
                          {activeCount}{" "}
                          {activeCount === 1 ? "request" : "requests"} currently
                          in progress
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/citizen/complaints")}
                      className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      Track Progress
                      <TrendingUp className="w-4 h-4" />
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DashboardStats
            totalComplaints={dashboardData.stats.total}
            openCount={dashboardData.stats.open}
            inProgressCount={dashboardData.stats.inProgress}
            resolvedCount={dashboardData.stats.resolved}
            onStatClick={(status) => {
              router.push(`/citizen/complaints?status=${status}`);
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black text-foreground">
                Quick Actions
              </h2>
            </div>
            <p className="text-sm text-muted-foreground font-semibold">
              Access frequently used services instantly
            </p>
          </div>
          <QuickActions
            complaintsCount={dashboardData.stats.total}
            pendingBillsCount={dashboardData.bills.length}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <RecentComplaints complaints={dashboardData.complaints} />
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <RecentNotices
                notices={dashboardData.notices}
                wardNumber={dashboardData.profile.wardNumber}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <PendingBills
                bills={dashboardData.bills}
                totalPendingAmount={totalPendingAmount}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}