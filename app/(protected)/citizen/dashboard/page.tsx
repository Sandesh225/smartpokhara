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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Design System
import { Container, Section, PageHeader } from "@/lib/design-system/container";

// Shared Components
import DashboardStats from "@/app/(protected)/citizen/dashboard/_components/DashboardStats";

import { cn } from "@/lib/utils";

import QuickActions from "./_components/QuickActions";
import RecentNotices from "./_components/RecentNotices";
import RecentComplaints from "./_components/RecentComplaints";
import PendingBills from "./_components/PendingBills";

// Types
interface Ward {
  ward_number: number;
  name: string;
}

interface Profile {
  full_name: string;
  ward: Ward | null;
}

interface Complaint {
  id: string;
  status: string;
  submitted_at: string;
  [key: string]: any;
}

interface Bill {
  id: string;
  status: string;
  [key: string]: any;
}

interface Notice {
  id: string;
  published_at: string;
  [key: string]: any;
}

interface DashboardState {
  profile: {
    name: string;
    wardNumber: number | null;
    wardName: string;
  };
  complaints: Complaint[];
  bills: Bill[];
  notices: Notice[];
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  loading: boolean;
  error: string | null;
}

interface EmergencyContact {
  icon: string;
  label: string;
  phone: string;
}

// Emergency Contact Component
function EmergencyItem({ icon, label, phone }: EmergencyContact) {
  return (
    <motion.a
      href={`tel:${phone}`}
      className="flex items-center justify-between p-4 hover:bg-white/10 transition-all duration-200 group rounded-xl"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Call ${label} at ${phone}`}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-300"
          role="img"
          aria-label={label}
        >
          {icon}
        </span>
        <span className="font-bold text-sm lg:text-base">{label}</span>
      </div>
      <span className="bg-white text-destructive font-black px-3 py-2 rounded-xl font-mono tabular-nums text-xs lg:text-sm shadow-md group-hover:shadow-lg transition-shadow">
        {phone}
      </span>
    </motion.a>
  );
}

// Main Dashboard Component
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

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Memoized greeting based on time of day
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Subha Prabhat";
    if (hour < 18) return "Namaste";
    return "Subha Sandhya";
  }, [currentTime]);

  // Calculate complaint statistics
  const calculateStats = useCallback((complaints: Complaint[]) => {
    const openStatuses = ["received", "under_review", "assigned"];
    const resolvedStatuses = ["resolved", "closed"];

    return {
      total: complaints.length,
      open: complaints.filter((c) => openStatuses.includes(c.status)).length,
      inProgress: complaints.filter((c) => c.status === "in_progress").length,
      resolved: complaints.filter((c) => resolvedStatuses.includes(c.status))
        .length,
    };
  }, []);

  // Fetch dashboard data
  const fetchDashboardState = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);

      try {
        // Verify user authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          toast.error("Authentication required");
          router.push("/login");
          return;
        }

        // Fetch all dashboard data in parallel
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

        // Handle profile data errors
        if (profileRes.error) {
          throw new Error(`Profile fetch failed: ${profileRes.error.message}`);
        }

        // Handle complaints data errors
        if (complaintsRes.error) {
          throw new Error(
            `Complaints fetch failed: ${complaintsRes.error.message}`
          );
        }

        // Process data with proper null handling
        const complaintsList = complaintsRes.data || [];
        const stats = calculateStats(complaintsList);

        const profileData = profileRes.data as Profile | null;
        const wardData = profileData?.ward as Ward | null;

        setDashboardData({
          profile: {
            name: profileData?.full_name?.split(" ")[0] || "Citizen",
            wardNumber: wardData?.ward_number ?? null,
            wardName: wardData?.name || "",
          },
          complaints: complaintsList.slice(0, 5),
          bills: billsRes.data || [],
          notices: noticesRes.data || [],
          stats,
          loading: false,
          error: null,
        });

        if (isRefresh) {
          toast.success("City Registry Synced", {
            description: "All data updated successfully",
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "City server connection timeout";

        console.error("Dashboard fetch error:", error);

        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        toast.error("Failed to load dashboard", {
          description: errorMessage,
        });
      } finally {
        setIsRefreshing(false);
      }
    },
    [router, supabase, calculateStats]
  );

  // Initial data fetch
  useEffect(() => {
    fetchDashboardState();
  }, [fetchDashboardState]);

  // Show loading skeleton
  if (dashboardData.loading) {
    return <DashboardSkeleton />;
  }

  const { profile, stats, complaints, bills, notices, error } = dashboardData;
  const activeReportsCount = stats.open + stats.inProgress;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <Container size="wide" spacing="none" className="pt-3 pb-8">
        <Section spacing="tight">
          {/* Header */}
          <PageHeader
            title={`${greeting}, ${profile.name}`}
            subtitle="Track municipal records and access essential services."
            badge={
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="glass border-primary/30 text-primary font-bold px-3 py-1.5 rounded-full text-xs"
                >
                  <MapPin className="w-3 h-3 mr-1.5" />
                  {profile.wardNumber
                    ? `Ward ${profile.wardNumber} - ${profile.wardName}`
                    : "Global Citizen"}
                </Badge>
                <Badge
                  variant="outline"
                  className="glass border-border/30 text-muted-foreground font-medium px-3 py-1.5 rounded-full text-xs"
                >
                  <Calendar className="w-3 h-3 mr-1.5" />
                  {format(currentTime, "MMM do, yyyy")}
                </Badge>
              </div>
            }
            actions={
              <div className="glass flex items-center gap-3 px-4 py-2 rounded-xl shadow-sm">
                <div className="flex flex-col items-end pr-3 border-r border-border/50">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                    Pokhara
                  </span>
                  <span className="text-base font-black font-mono tabular-nums text-foreground">
                    {format(currentTime, "HH:mm")}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => fetchDashboardState(true)}
                  disabled={isRefreshing}
                  className={cn(
                    "h-8 w-8 rounded-lg transition-all hover:bg-primary/10",
                    isRefreshing && "animate-spin"
                  )}
                  aria-label="Refresh dashboard"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefreshing ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </Button>
              </div>
            }
            className="mb-6"
          />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 glass-glow">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => fetchDashboardState(true)}
                  className="ml-2 h-auto p-0 text-inherit underline"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Active Reports Banner */}
          <AnimatePresence>
            {activeReportsCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <Card className="border-none bg-gradient-to-br from-primary via-primary/95 to-secondary text-white shadow-xl rounded-2xl overflow-hidden relative elevation-3">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
                  <CardContent className="relative p-5 lg:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md ring-2 ring-white/30">
                        <Activity className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg lg:text-xl tracking-tight mb-0.5">
                          Active Reports
                        </h3>
                        <p className="opacity-95 text-xs lg:text-sm font-medium">
                          Processing{" "}
                          <span className="font-mono font-black text-base px-2 py-0.5 bg-white/20 rounded-lg">
                            {activeReportsCount}
                          </span>{" "}
                          {activeReportsCount === 1 ? "request" : "requests"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="font-bold rounded-xl h-10 px-6 text-sm shadow-lg hover:shadow-xl transition-all"
                      onClick={() => router.push("/citizen/complaints")}
                    >
                      Track Progress
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dashboard Statistics */}
          <DashboardStats
            totalComplaints={stats.total}
            openCount={stats.open}
            inProgressCount={stats.inProgress}
            resolvedCount={stats.resolved}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Services & Complaints */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <section className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-foreground">
                    Direct Services
                  </h2>
                </div>
                <QuickActions
                  complaintsCount={stats.total}
                  pendingBillsCount={bills.length}
                />
              </section>

              {/* Recent Complaints */}
              <section className="stone-card p-1">
                <RecentComplaints complaints={complaints} />
              </section>
            </div>

            {/* Right Column - Notices & Emergency */}
            <aside className="space-y-6">
              {/* Recent Notices */}
              <RecentNotices notices={notices} />

              {/* Emergency Contacts */}
              <Card className="border-none bg-gradient-to-br from-destructive to-destructive/90 text-white shadow-xl rounded-2xl overflow-hidden elevation-3">
                <div className="p-4 border-b border-white/20 flex justify-between items-center bg-black/10">
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Emergency
                  </h3>
                  <Activity className="w-5 h-5 opacity-70 animate-pulse" />
                </div>
                <div className="divide-y divide-white/10">
                  <EmergencyItem icon="🚔" label="Police" phone="100" />
                  <EmergencyItem icon="🚑" label="Ambulance" phone="102" />
                  <EmergencyItem icon="🚒" label="Fire" phone="101" />
                </div>
              </Card>
            </aside>
          </div>
        </Section>
      </Container>
    </motion.div>
  );
}

// Loading Skeleton Component
function DashboardSkeleton() {
  return (
    <Container size="wide" spacing="none" className="pt-3 pb-8">
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-12 w-80 rounded-xl" />
          <Skeleton className="h-5 w-96 rounded-lg" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
      </div>
    </Container>
  );
}