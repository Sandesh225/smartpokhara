"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  WifiOff,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  ShieldCheck,
  Signal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // UX: Last Updated State
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

  // 1. Fetch Data Logic
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
        setLastUpdated(new Date()); // Update timestamp

        // UX: Soft feedback on manual refresh instead of heavy toast
        if (isRefresh) {
          // Optional: minimal sound or subtle visual flash could go here
        }
      } catch (error) {
        console.error("❌ Error:", error);
        toast.error("Failed to load dashboard");
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

  // UX: Helper for "Last updated" text
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // UX: Context-Aware Subtitle Logic
  const activeIssues = stats.open + stats.inProgress;
  const getHeaderSubtitle = () => {
    if (data.loading) return "Loading your municipal overview...";
    if (activeIssues > 0)
      return `You have ${activeIssues} active issue${activeIssues === 1 ? "" : "s"} being processed.`;
    return "You have no active issues right now. Everything looks good!";
  };

  if (data.loading) {
    return (
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="relative mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping text-primary/20 rounded-full" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 animate-pulse">
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {userName ? `Welcome back, ${userName}` : "Citizen Dashboard"}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
            {wardId ? (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100 font-semibold">
                Ward {wardId}
              </span>
            ) : null}
            {/* 2.1 Context-Aware Subtitle */}
            <span
              className={activeIssues > 0 ? "text-blue-600" : "text-gray-500"}
            >
              {getHeaderSubtitle()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3" role="group">
          {/* 3. Connection Status UX */}
          {!isConnected ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200 animate-pulse cursor-help">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Reconnecting...</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Live updates will resume automatically once connected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-100 cursor-help">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </div>
                </TooltipTrigger>
                {/* 3.1 Live Tooltip */}
                <TooltipContent>
                  <p>Updates appear automatically when data changes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="flex items-center gap-2">
            {/* 2.2 Last Updated Feedback */}
            {lastUpdated && (
              <span className="text-[10px] text-gray-400 font-medium hidden sm:inline-block">
                Updated {formatTime(lastUpdated)}
              </span>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="gap-2 transition-all active:scale-95 border-gray-200"
              aria-label="Refresh dashboard data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </header>

      {/* --- STATS SECTION --- */}
      <section aria-label="Statistics overview">
        {/* 5.1 & 5.2 Improvements would be passed as props if DashboardStats supported them, 
             otherwise handled by tooltips inside that component */}
        <DashboardStats
          totalComplaints={stats.total}
          openCount={stats.open}
          inProgressCount={stats.inProgress}
          resolvedCount={stats.resolved}
          onStatClick={handleStatClick}
        />
      </section>

      {/* --- QUICK ACTIONS --- */}
      <section aria-label="Quick actions">
        <QuickActions
          complaintsCount={data.totalComplaints}
          pendingBillsCount={data.pendingBillsCount}
          noticesCount={data.notices.length}
        />
      </section>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Complaints & Bills */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Complaints */}
          <div className="relative">
            <RecentComplaints complaints={data.complaints} />
            {data.complaints.length === 0 && (
              // 7.2 Positive Reassurance Empty State
              <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mt-[-1rem] flex flex-col items-center">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-gray-900 font-medium">
                  No active complaints
                </p>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  That's good news! If you notice any issues in your ward,
                  report them here.
                </p>
                <Button
                  variant="link"
                  className="text-primary mt-2 h-auto p-0 font-semibold"
                  onClick={() => router.push("/citizen/complaints/new")}
                >
                  Report an Issue
                </Button>
              </div>
            )}
          </div>

          {/* Pending Bills */}
          <div className="relative">
            <PendingBills bills={data.bills} />
            {/* 8.1 Bill Safety/Reassurance */}
            {data.bills.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 px-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                <span>Secure payments via official Pokhara Metro gateway.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Notices & Emergency */}
        <aside className="space-y-8">
          <div className="relative">
            <RecentNotices notices={data.notices} wardNumber={wardId} />
            {/* 9.2 Transparency Text */}
            {wardId && data.notices.length > 0 && (
              <p className="text-[10px] text-gray-400 text-right mt-1 px-1">
                Showing notices relevant to Ward {wardId} & City-wide
              </p>
            )}
          </div>

          {/* EMERGENCY SECTION */}
          <div
            className="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm overflow-hidden"
            role="region"
            aria-label="Emergency contacts"
          >
            <div className="bg-red-50/50 p-5 border-b border-red-100 flex items-start gap-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                <Signal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Emergency Contacts
                </h3>
                {/* 10.1 Location Context */}
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Applicable within Pokhara Metropolitan City
                </p>
              </div>
            </div>

            <div className="p-2" role="list">
              {[
                { label: "Police Control", number: "100" },
                { label: "Ambulance", number: "102" },
                { label: "Fire Brigade", number: "101" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group transition-colors"
                  role="listitem"
                >
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                  <a
                    href={`tel:${item.number}`}
                    className="flex items-center gap-2 font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-md group-hover:bg-red-600 group-hover:text-white transition-all"
                    aria-label={`Call ${item.label} at ${item.number}`}
                  >
                    {item.number}
                  </a>
                </div>
              ))}
            </div>
            {/* 10.2 Offline Awareness */}
            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
              <p className="text-[10px] text-gray-500">
                These numbers work even without internet connection
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
