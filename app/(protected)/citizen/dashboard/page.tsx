"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, WifiOff } from "lucide-react";

// Components
import DashboardStats from "@/components/citizen/dashboard/DashboardStats";
import RecentComplaints from "@/components/citizen/dashboard/RecentComplaints";
import PendingBills from "@/components/citizen/dashboard/PendingBills";
import RecentNotices from "@/components/citizen/dashboard/RecentNotices";
import QuickActions from "@/components/citizen/dashboard/QuickActions";

// Types
import type {
  Complaint,
  Bill,
  Notice,
} from "@/lib/supabase/queries/complaints";

interface DashboardData {
  complaints: Complaint[];
  bills: Bill[];
  notices: Notice[];
  loading: boolean;
  totalComplaints: number;
  pendingBillsCount: number;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [isConnected, setIsConnected] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [data, setData] = useState<DashboardData>({
    complaints: [],
    bills: [],
    notices: [],
    loading: true,
    totalComplaints: 0,
    pendingBillsCount: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  // 1. Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/auth/login");
          return;
        }

        setUserId(user.id);

        // Fetch User Profile for Ward ID
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("ward_id")
          .eq("user_id", user.id)
          .single();

        const wardId = profile?.ward_id || null;

        // --- A. Complaints ---
        // 1. Recent list
        const { data: complaints } = await supabase
          .from("complaints")
          .select("*")
          .eq("citizen_id", user.id)
          .order("submitted_at", { ascending: false })
          .limit(5);

        // 2. Stats Counts (Parallel for speed)
        const [totalRes, openRes, progressRes, resolvedRes] = await Promise.all(
          [
            supabase
              .from("complaints")
              .select("id", { count: "exact", head: true })
              .eq("citizen_id", user.id),
            supabase
              .from("complaints")
              .select("id", { count: "exact", head: true })
              .eq("citizen_id", user.id)
              .in("status", ["received", "under_review", "assigned"]),
            supabase
              .from("complaints")
              .select("id", { count: "exact", head: true })
              .eq("citizen_id", user.id)
              .eq("status", "in_progress"),
            supabase
              .from("complaints")
              .select("id", { count: "exact", head: true })
              .eq("citizen_id", user.id)
              .in("status", ["resolved", "closed"]),
          ]
        );

        // --- B. Bills ---
        // FIX: Removed 'overdue' from .in() because it's not a valid enum value.
        // Overdue bills are just 'pending' bills with is_overdue=true
        const { data: bills, count: billsCount } = await supabase
          .from("bills")
          .select("*", { count: "exact" })
          .eq("citizen_id", user.id)
          .eq("status", "pending") // Corrected filter
          .order("due_date", { ascending: true });

        // --- C. Notices ---
        let noticeQuery = supabase
          .from("notices")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(5);

        if (wardId) {
          noticeQuery = noticeQuery.or(
            `is_public.eq.true,ward_id.eq.${wardId}`
          );
        } else {
          noticeQuery = noticeQuery.eq("is_public", true);
        }
        const { data: notices } = await noticeQuery;

        // Set State
        setData({
          complaints: (complaints as Complaint[]) || [],
          bills: (bills as Bill[]) || [],
          notices: (notices as Notice[]) || [],
          loading: false,
          totalComplaints: totalRes.count || 0,
          pendingBillsCount: billsCount || 0,
        });

        setStats({
          total: totalRes.count || 0,
          open: openRes.count || 0,
          inProgress: progressRes.count || 0,
          resolved: resolvedRes.count || 0,
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
        toast.error("Failed to load dashboard data");
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [router, supabase]);

  // 2. Real-time Subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`citizen-dashboard-${userId}`);

    // Listen for Complaint Changes
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "complaints",
        filter: `citizen_id=eq.${userId}`,
      },
      (payload) => {
        // Simple strategy: reload page data on any change to ensure consistency
        // (In a production app, you might update state optimistically)
        router.refresh();
      }
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") setIsConnected(true);
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
        setIsConnected(false);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, router]);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 max-w-7xl">
      {/* Header & Connection Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Citizen Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back to Smart City Pokhara
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            isConnected
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 font-semibold">
                System Live
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Reconnecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <DashboardStats
        totalComplaints={stats.total}
        openCount={stats.open}
        inProgressCount={stats.inProgress}
        resolvedCount={stats.resolved}
      />

      {/* Quick Actions */}
      <QuickActions
        complaintsCount={data.totalComplaints}
        pendingBillsCount={data.pendingBillsCount}
        noticesCount={data.notices.length}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Complaints & Bills */}
        <div className="lg:col-span-2 space-y-8">
          <RecentComplaints complaints={data.complaints} />
          <PendingBills bills={data.bills} />
        </div>

        {/* Right Column: Notices & Info */}
        <div className="space-y-8">
          <RecentNotices notices={data.notices} />

          {/* Emergency Contact Card */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
            <h3 className="font-semibold text-destructive mb-4">
              Emergency Contacts
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-destructive/10">
                <span>City Police</span>
                <span className="font-bold bg-white px-2 py-1 rounded border border-destructive/10">
                  100
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-destructive/10">
                <span>Ambulance</span>
                <span className="font-bold bg-white px-2 py-1 rounded border border-destructive/10">
                  102
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-destructive/10">
                <span>Fire Brigade</span>
                <span className="font-bold bg-white px-2 py-1 rounded border border-destructive/10">
                  101
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pokhara Metro</span>
                <span className="font-bold bg-white px-2 py-1 rounded border border-destructive/10">
                  061-521105
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
