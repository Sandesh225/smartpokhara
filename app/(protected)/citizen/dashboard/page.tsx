"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  RefreshCw,
  Activity,
  Sparkles,
  ChevronRight,
  MapPin,
  Calendar,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Container, Section, PageHeader } from "@/lib/design-system/container";
import DashboardStats from "@/app/(protected)/citizen/dashboard/_components/DashboardStats";
import { cn } from "@/lib/utils";

// Sub-components
import QuickActions from "./_components/QuickActions";
import RecentNotices from "./_components/RecentNotices";
import RecentComplaints from "./_components/RecentComplaints";

// Types
interface DashboardState {
  profile: { name: string; wardNumber: number | null; wardName: string };
  complaints: any[];
  bills: any[];
  notices: any[];
  stats: { total: number; open: number; inProgress: number; resolved: number };
  loading: boolean;
  error: string | null;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardState>({
    profile: { name: "", wardNumber: null, wardName: "" },
    complaints: [],
    bills: [],
    notices: [],
    stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    loading: true,
    error: null,
  });

  // Time-based Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Subha Prabhat", icon: "🌅" };
    if (hour < 18) return { text: "Namaste", icon: "☀️" };
    return { text: "Subha Sandhya", icon: "🌙" };
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

        const [profileRes, complaintsRes, billsRes, noticesRes] =
          await Promise.all([
            supabase
              .from("user_profiles")
              .select("full_name, ward:wards(ward_number, name)")
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
        const openCount = complaintsList.filter((c) =>
          ["received", "under_review", "assigned"].includes(c.status)
        ).length;
        const inProgressCount = complaintsList.filter(
          (c) => c.status === "in_progress"
        ).length;

        setDashboardData({
          profile: {
            name: profileRes.data?.full_name?.split(" ")[0] || "Citizen",
            wardNumber: profileRes.data?.ward?.ward_number ?? null,
            wardName: profileRes.data?.ward?.name || "",
          },
          complaints: complaintsList.slice(0, 5),
          bills: billsRes.data || [],
          notices: noticesRes.data || [],
          stats: {
            total: complaintsList.length,
            open: openCount,
            inProgress: inProgressCount,
            resolved: complaintsList.filter((c) =>
              ["resolved", "closed"].includes(c.status)
            ).length,
          },
          loading: false,
          error: null,
        });
        if (isRefresh) toast.success("Dashboard refreshed successfully");
      } catch (err: any) {
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

  if (dashboardData.loading) return <DashboardSkeleton />;

  const activeReportsCount =
    dashboardData.stats.open + dashboardData.stats.inProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-12"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-primary/10 dark:from-primary/15 to-transparent -z-10" />

      <Container size="wide" className="px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
          <div className="space-y-3">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Badge
                variant="outline"
                className="glass border-2 border-primary/30 text-primary font-black px-5 py-2.5 text-sm elevation-1"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {dashboardData.profile.wardNumber
                  ? `Ward ${dashboardData.profile.wardNumber}`
                  : "Pokhara Metro"}
              </Badge>
              <Badge
                variant="outline"
                className="glass border-2 border-border text-muted-foreground font-bold px-5 py-2.5 text-sm elevation-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {format(currentTime, "MMMM do, yyyy")}
              </Badge>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {greeting.text},{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {dashboardData.profile.name}
              </span>{" "}
              <span className="inline-block">{greeting.icon}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base font-semibold max-w-2xl">
              Welcome to your digital municipal command center.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass px-5 py-3 rounded-2xl flex items-center gap-4 border-2 border-border elevation-2">
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Local Time
                </p>
                <p className="text-2xl font-black font-mono leading-none text-foreground mt-1">
                  {format(currentTime, "HH:mm")}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => fetchDashboardState(true)}
                disabled={isRefreshing}
                className={cn(
                  "rounded-xl hover:bg-primary/15 transition-all h-11 w-11",
                  isRefreshing && "animate-spin"
                )}
              >
                <RefreshCw className="w-5 h-5 text-primary" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {activeReportsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/15 to-secondary/15 overflow-hidden rounded-2xl elevation-3">
              <CardContent className="p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center backdrop-blur-sm elevation-2">
                    <Activity className="w-7 h-7 animate-pulse text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-foreground mb-1.5">
                      Active Inquiries
                    </h3>
                    <p className="text-sm text-muted-foreground font-semibold">
                      You have{" "}
                      <span className="font-black text-primary">
                        {activeReportsCount}
                      </span>{" "}
                      {activeReportsCount === 1 ? "request" : "requests"}{" "}
                      currently being processed.
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl px-7 py-6 text-sm sm:text-base elevation-2 hover:elevation-3 transition-all"
                  onClick={() => router.push("/citizen/complaints")}
                >
                  View Details <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="xl:col-span-2 space-y-6">
            <section>
              <DashboardStats
                totalComplaints={dashboardData.stats.total}
                openCount={dashboardData.stats.open}
                inProgressCount={dashboardData.stats.inProgress}
                resolvedCount={dashboardData.stats.resolved}
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                    Services
                  </h2>
                </div>
              </div>
              <QuickActions
                complaintsCount={dashboardData.stats.total}
                pendingBillsCount={dashboardData.bills.length}
              />
            </section>

            <section>
              <RecentComplaints complaints={dashboardData.complaints} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <Bell className="w-6 h-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground">
                  Bulletin
                </h2>
              </div>
              <RecentNotices
                notices={dashboardData.notices}
                wardNumber={dashboardData.profile.wardNumber}
              />
            </div>

            <Card className="border-2 border-destructive/40 bg-gradient-to-br from-destructive to-red-700 text-white rounded-2xl elevation-3 overflow-hidden">
              <div className="p-6 border-b-2 border-white/20 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="h-3 w-3 bg-white rounded-full animate-ping" />
                  <h3 className="font-black uppercase tracking-widest text-sm">
                    Emergency Hotlines
                  </h3>
                </div>
              </div>
              <div className="p-4">
                {[
                  { icon: "🚔", label: "Police", phone: "100" },
                  { icon: "🚑", label: "Ambulance", phone: "102" },
                  { icon: "🚒", label: "Fire", phone: "101" },
                ].map((item, idx) => (
                  <motion.a
                    key={idx}
                    href={`tel:${item.phone}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-5 rounded-xl hover:bg-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="font-black text-base">{item.label}</span>
                    </div>
                    <span className="bg-white text-destructive px-6 py-2.5 rounded-xl font-mono font-black text-sm elevation-2 group-hover:elevation-3 transition-all">
                      {item.phone}
                    </span>
                  </motion.a>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </Container>
    </motion.div>
  );
}

// Optimized Skeleton
function DashboardSkeleton() {
  return (
    <Container size="wide" className="pt-12 space-y-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-24 w-full max-w-3xl rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Skeleton className="h-full min-h-[600px] rounded-2xl" />
      </div>
    </Container>
  );
}