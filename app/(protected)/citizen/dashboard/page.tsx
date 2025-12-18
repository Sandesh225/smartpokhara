"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  WifiOff,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Signal,
  Phone,
  Sparkles,
  TrendingUp,
  Activity,
} from "lucide-react";

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

// Component Imports
import DashboardStats from "@/components/citizen/dashboard/DashboardStats";
import RecentComplaints from "@/components/citizen/dashboard/RecentComplaints";
import PendingBills from "@/components/citizen/dashboard/PendingBills";
import RecentNotices from "@/components/citizen/dashboard/RecentNotices";
import QuickActions from "@/components/citizen/dashboard/QuickActions";

export default function CitizenDashboard() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [isConnected, setIsConnected] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [wardId, setWardId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data State
  const [data, setData] = useState({
    complaints: [],
    bills: [],
    notices: [],
    loading: true,
    totalComplaints: 0,
    pendingBillsCount: 0,
  });

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  // Fetch Data Logic
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }
        setUserId(user.id);

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("ward_id, first_name")
          .eq("user_id", user.id)
          .single();

        const userWardId = profile?.ward_id;
        setWardId(userWardId);
        if (profile?.first_name) setUserName(profile.first_name);

        const { data: allComplaints, error: complaintsError } = await supabase
          .from("complaints")
          .select("*")
          .eq("citizen_id", user.id)
          .order("submitted_at", { ascending: false });

        if (complaintsError) throw complaintsError;

        const complaintsList = allComplaints || [];

        const total = complaintsList.length;
        const open = complaintsList.filter((c) =>
          ["received", "under_review", "assigned", "reopened"].includes(
            c.status
          )
        ).length;
        const inProgress = complaintsList.filter(
          (c) => c.status === "in_progress"
        ).length;
        const resolved = complaintsList.filter((c) =>
          ["resolved", "closed"].includes(c.status)
        ).length;

        const { data: bills } = await supabase
          .from("bills")
          .select("*")
          .eq("citizen_id", user.id)
          .eq("status", "pending");

        let noticeQuery = supabase
          .from("notices")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(5);

        if (userWardId) {
          noticeQuery = noticeQuery.or(
            `is_public.eq.true,ward_id.eq.${userWardId}`
          );
        } else {
          noticeQuery = noticeQuery.eq("is_public", true);
        }
        const { data: notices } = await noticeQuery;

        setData({
          complaints: complaintsList.slice(0, 5),
          bills: bills || [],
          notices: notices || [],
          loading: false,
          totalComplaints: total,
          pendingBillsCount: bills?.length || 0,
        });

        setStats({ total, open, inProgress, resolved });
        setLastUpdated(new Date());

        if (isRefresh) {
          toast.success("Dashboard refreshed", {
            description: "All data is now up to date",
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("❌ Error:", error);
        toast.error("Failed to load dashboard", {
          description: "Please try refreshing the page",
        });
      } finally {
        setIsRefreshing(false);
        if (!isRefresh) setData((prev) => ({ ...prev, loading: false }));
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Subscription
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
        (payload) => {
          fetchData();
          router.refresh();

          if (payload.eventType === "UPDATE") {
            const newStatus = payload.new?.status;
            const oldStatus = payload.old?.status;
            const complaintId = payload.new?.id;

            if (newStatus === "in_progress" && oldStatus !== "in_progress") {
              toast.info("Update on your complaint", {
                description: "Staff have started working on your issue.",
                action: {
                  label: "View",
                  onClick: () =>
                    router.push(`/citizen/complaints/${complaintId}`),
                },
              });
            }
            if (newStatus === "resolved" && oldStatus !== "resolved") {
              toast.success("Complaint Resolved", {
                description: "Your issue has been marked as resolved.",
                action: {
                  label: "Rate Service",
                  onClick: () =>
                    router.push(
                      `/citizen/complaints/${complaintId}?action=rate`
                    ),
                },
              });
            }
          }
        }
      )
      .subscribe((status) => setIsConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchData, router]);

  const handleStatClick = (statusFilter: string) => {
    router.push(`/citizen/complaints?status=${statusFilter}`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const activeIssues = stats.open + stats.inProgress;
  const getHeaderSubtitle = () => {
    if (data.loading) return "Loading your municipal overview...";
    if (activeIssues > 0)
      return `You have ${activeIssues} active issue${
        activeIssues === 1 ? "" : "s"
      } being processed.`;
    return "You have no active issues right now. Everything looks good!";
  };

  // Enhanced Loading Skeleton
  if (data.loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-6 md:py-8 space-y-8 max-w-7xl">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-9 w-80 max-w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-64 max-w-full" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-8 pb-24 max-w-7xl">
        {/* Enhanced Header with Status Banner */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                  {userName ? `Welcome back, ${userName}` : "Citizen Dashboard"}
                </h1>
                {activeIssues > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 px-3 py-1 text-sm font-semibold">
                    <Activity className="w-3.5 h-3.5 mr-1.5" />
                    {activeIssues} Active
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {wardId && (
                  <Badge
                    variant="secondary"
                    className="bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 px-3 py-1.5 font-medium shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                    Ward {wardId}
                  </Badge>
                )}
                <Separator
                  orientation="vertical"
                  className="h-4 hidden sm:block"
                />
                <p
                  className={`font-medium ${activeIssues > 0 ? "text-blue-600" : "text-slate-600"}`}
                >
                  {getHeaderSubtitle()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Connection Status */}
              {!isConnected ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="destructive"
                        className="gap-2 px-3 py-1.5 animate-pulse"
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        <span className="font-medium">Reconnecting</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs font-medium">
                        Live updates will resume automatically once connected
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-linear-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 gap-2 px-3 py-1.5 shadow-sm hover:shadow-md transition-all"
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="font-semibold">Live</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs font-medium mb-1">
                        Real-time updates enabled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Changes appear automatically as they happen
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />

              {/* Refresh Controls */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-1.5 shadow-sm">
                {lastUpdated && (
                  <span className="text-xs text-slate-600 font-medium hidden sm:inline-block tabular-nums">
                    {formatTime(lastUpdated)}
                  </span>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing}
                        aria-label="Refresh dashboard data"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs font-medium">Refresh all data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Status Banner - Only show when there are active issues */}
          {activeIssues > 0 && (
            <Card className="border-l-4 border-l-blue-500 bg-linear-to-r from-blue-50/50 to-transparent shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-slate-900">
                      Active Issues Summary
                    </h3>
                    <p className="text-sm text-slate-600">
                      {stats.open > 0 && `${stats.open} awaiting assignment`}
                      {stats.open > 0 && stats.inProgress > 0 && " • "}
                      {stats.inProgress > 0 &&
                        `${stats.inProgress} in progress`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/citizen/complaints")}
                    className="flex-shrink-0 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                  >
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </header>

        {/* Stats Section */}
        <section aria-label="Statistics overview" className="scroll-mt-6">
          <DashboardStats
            totalComplaints={stats.total}
            openCount={stats.open}
            inProgressCount={stats.inProgress}
            resolvedCount={stats.resolved}
            onStatClick={handleStatClick}
          />
        </section>

        {/* Quick Actions Section */}
        <section aria-label="Quick actions" className="scroll-mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Quick Actions
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Common tasks and shortcuts
            </p>
          </div>
          <QuickActions
            complaintsCount={data.totalComplaints}
            pendingBillsCount={data.pendingBillsCount}
            noticesCount={data.notices.length}
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Complaints & Bills */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Complaints */}
            <div className="space-y-4">
              <RecentComplaints complaints={data.complaints} />

              {/* Empty State Enhancement */}
              {data.complaints.length === 0 && (
                <Card className="border-2 border-dashed bg-linear-to-br from-slate-50 to-slate-100/50 shadow-none">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full animate-pulse" />
                      <div className="relative h-16 w-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h3 className="font-bold text-lg text-slate-900">
                        No Active Complaints
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Great news! You don't have any complaints at the moment.
                        If you notice any issues in your ward, you can report
                        them here.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="mt-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                      onClick={() => router.push("/citizen/complaints/new")}
                    >
                      Report New Issue
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pending Bills */}
            <div className="space-y-3">
              <PendingBills bills={data.bills} />
              {data.bills.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-600 px-2 py-1.5 bg-green-50 rounded-lg border border-green-100">
                  <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">
                    Secure payments powered by official Pokhara Metro payment
                    gateway
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Notices & Emergency */}
          <aside className="space-y-8">
            {/* Recent Notices */}
            <div className="space-y-3">
              <RecentNotices notices={data.notices} wardNumber={wardId} />
              {wardId && data.notices.length > 0 && (
                <p className="text-xs text-slate-500 text-right px-2 font-medium">
                  Showing {data.notices.length} notices for Ward {wardId} &
                  city-wide announcements
                </p>
              )}
            </div>

            {/* Enhanced Emergency Contact Card */}
            <Card
              className="border-l-4 border-l-red-500 overflow-hidden shadow-lg hover:shadow-xl transition-all"
              role="region"
              aria-label="Emergency contacts"
            >
              <CardHeader className="bg-linear-to-br from-red-50 via-orange-50 to-red-50 border-b border-red-100 pb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white text-red-600 rounded-xl shadow-md border border-red-100 flex-shrink-0">
                    <Signal className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Emergency Services
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-red-600/80 uppercase tracking-wide">
                      Available 24/7 • Pokhara Metropolitan City
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div role="list" className="divide-y divide-slate-200">
                  {[
                    { label: "Police Control", number: "100", icon: "🚔" },
                    { label: "Ambulance", number: "102", icon: "🚑" },
                    { label: "Fire Brigade", number: "101", icon: "🚒" },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center px-6 py-5 hover:bg-red-50/50 transition-all group"
                      role="listitem"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-sm font-semibold text-slate-900 flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="flex flex-col">
                          <span>{item.label}</span>
                          <span className="text-xs text-slate-500 font-normal">
                            Free call from any network
                          </span>
                        </span>
                      </span>
                      <a
                        href={`tel:${item.number}`}
                        className="text-base font-black text-red-600 bg-red-50 px-4 py-2.5 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md ring-offset-2 focus-visible:ring-2 focus-visible:ring-red-600 outline-none min-w-[80px] text-center"
                        aria-label={`Call ${item.label} at ${item.number}`}
                      >
                        {item.number}
                      </a>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-slate-600" />
                    <p className="text-xs font-semibold text-slate-700">
                      No internet required
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    These emergency numbers work from any phone, even without
                    mobile balance or internet connection
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}