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
  AlertCircle,
  Bell,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  const fetchDashboardState = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [profileRes, complaintsRes, billsRes, noticesRes] = await Promise.all([
        supabase.from("user_profiles").select("full_name, ward:wards(ward_number, name)").eq("user_id", user.id).maybeSingle(),
        supabase.from("complaints").select("*").eq("citizen_id", user.id).order("submitted_at", { ascending: false }),
        supabase.from("bills").select("*").eq("citizen_id", user.id).eq("status", "pending"),
        supabase.from("notices").select("*").order("published_at", { ascending: false }).limit(5),
      ]);

      const complaintsList = complaintsRes.data || [];
      const openCount = complaintsList.filter(c => ["received", "under_review", "assigned"].includes(c.status)).length;
      const inProgressCount = complaintsList.filter(c => c.status === "in_progress").length;

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
          resolved: complaintsList.filter(c => ["resolved", "closed"].includes(c.status)).length,
        },
        loading: false,
        error: null,
      });
      if (isRefresh) toast.success("City Registry Synced");
    } catch (err: any) {
      setDashboardData(prev => ({ ...prev, loading: false, error: err.message }));
    } finally { setIsRefreshing(false); }
  }, [router, supabase]);

  useEffect(() => { fetchDashboardState(); }, [fetchDashboardState]);

  if (dashboardData.loading) return <DashboardSkeleton />;

  const activeReportsCount = dashboardData.stats.open + dashboardData.stats.inProgress;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background transition-colors duration-500 pb-12"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10 dark:from-primary/10" />

      <Container size="wide" className="p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <motion.div 
              initial={{ x: -20 }} animate={{ x: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <Badge variant="outline" className="glass dark:border-primary/20 text-primary font-bold px-3 py-1">
                <MapPin className="w-3 h-3 mr-1" />
                {dashboardData.profile.wardNumber ? `Ward ${dashboardData.profile.wardNumber}` : "Pokhara Metro"}
              </Badge>
              <Badge variant="outline" className="glass text-muted-foreground font-medium px-3 py-1">
                <Calendar className="w-3 h-3 mr-1" />
                {format(currentTime, "MMMM do")}
              </Badge>
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              {greeting.text}, <span className="text-primary dark:text-primary">{dashboardData.profile.name}</span> {greeting.icon}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">
              Welcome to your digital municipal command center.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-2xl flex items-center gap-4 dark:glass-glow">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Local Time</p>
                <p className="text-xl font-black font-mono leading-none">{format(currentTime, "HH:mm")}</p>
              </div>
              <Button
                size="icon" variant="ghost"
                onClick={() => fetchDashboardState(true)}
                disabled={isRefreshing}
                className={cn("rounded-xl hover:bg-primary/10 transition-all", isRefreshing && "animate-spin")}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {activeReportsCount > 0 && (
          <motion.div 
            layoutId="active-banner"
            className="mb-8 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <Card className="relative border-none bg-primary dark:bg-card text-white dark:text-foreground overflow-hidden rounded-3xl shadow-2xl">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 dark:bg-primary/20 flex items-center justify-center backdrop-blur-xl">
                    <Activity className="w-7 h-7 animate-pulse text-white dark:text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-glow">Active Inquiries</h3>
                    <p className="opacity-80 font-medium">You have <span className="font-bold underline">{activeReportsCount}</span> requests currently being processed by ward officials.</p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-neutral-100 dark:bg-primary dark:text-primary-foreground font-bold rounded-2xl px-8"
                  onClick={() => router.push("/citizen/complaints")}
                >
                  View Details <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
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
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  <h2 className="text-2xl font-black uppercase tracking-tight">Services</h2>
                </div>
              </div>
              <QuickActions 
                complaintsCount={dashboardData.stats.total} 
                pendingBillsCount={dashboardData.bills.length} 
              />
            </section>

            <section className="stone-card dark:stone-card-elevated overflow-hidden">
               <RecentComplaints complaints={dashboardData.complaints} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight">Bulletin</h2>
              </div>
              <RecentNotices notices={dashboardData.notices} />
            </div>

            <Card className="border-none bg-gradient-to-br from-destructive to-red-700 text-white rounded-3xl shadow-xl overflow-hidden elevation-3">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-white rounded-full animate-ping" />
                  <h3 className="font-black uppercase tracking-widest text-sm">Emergency Hotlines</h3>
                </div>
              </div>
              <div className="p-2">
                {[
                  { icon: "🚔", label: "Police", phone: "100" },
                  { icon: "🚑", label: "Ambulance", phone: "102" },
                  { icon: "🚒", label: "Fire", phone: "101" }
                ].map((item, idx) => (
                  <motion.a
                    key={idx}
                    href={`tel:${item.phone}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-bold">{item.label}</span>
                    </div>
                    <span className="bg-white text-destructive px-4 py-1.5 rounded-xl font-mono font-black text-sm shadow-lg group-hover:shadow-white/20">
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
    <Container size="wide" className="pt-12 space-y-12">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-16 w-full max-w-2xl rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
        <Skeleton className="h-full min-h-[500px] rounded-3xl" />
      </div>
    </Container>
  );
}