"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  RefreshCw,
  Activity,
  ChevronRight,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  CreditCard,
  Sparkles,
  Loader2,
  ShieldCheck,
  MapPin,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  /* ---------------------------------- */
  /* Lifecycle                           */
  /* ---------------------------------- */

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, [currentTime]);

  /* ---------------------------------- */
  /* Fetch Dashboard                     */
  /* ---------------------------------- */
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

        /* ---------------- PROFILE FIRST ---------------- */
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name, ward_id, ward:wards(ward_number, name)")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const wardId = profile?.ward_id ?? null;

        /* ---------------- PARALLEL REST ---------------- */
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

        setDashboardData({
          profile: {
            name: profile?.full_name?.split(" ")[0] || "Citizen",
            wardNumber: profile?.ward?.ward_number ?? null,
            wardName: profile?.ward?.name || "",
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

        if (isRefresh) toast.success("Dashboard refreshed");
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

  /* ---------------------------------- */
  /* Loading State                       */
  /* ---------------------------------- */

  if (!isMounted || dashboardData.loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-14 h-14 animate-spin text-primary" />
        <p className="font-bold text-lg">Loading Citizen Dashboard</p>
        <Badge variant="outline" className="tracking-widest uppercase text-xs">
          Pokhara Citizen Portal
        </Badge>
      </div>
    );
  }

  const activeCount = dashboardData.stats.open + dashboardData.stats.inProgress;

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */

  return (
    <div className="space-y-6 pb-12 px-4 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="border-b pb-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-black tracking-tight">
                {greeting}, {dashboardData.profile.name}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                {dashboardData.profile.wardName
                  ? `${dashboardData.profile.wardName} · Ward ${dashboardData.profile.wardNumber}`
                  : "Pokhara Metro"}
              </Badge>
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                {format(currentTime, "EEEE, MMM do")}
              </Badge>
            </div>
          </div>

          <button
            onClick={() => fetchDashboardState(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-card hover:bg-accent"
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* ACTIVE ALERT */}
      {activeCount > 0 && (
        <Card className="border-2 border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <p className="font-black text-lg">Active Requests</p>
                <p className="text-muted-foreground">
                  {activeCount} request{activeCount !== 1 && "s"} in progress
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/citizen/complaints")}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2"
            >
              Track
              <ChevronRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Complaints",
            value: dashboardData.stats.total,
            icon: FileText,
          },
          { label: "Open", value: dashboardData.stats.open, icon: AlertCircle },
          {
            label: "In Progress",
            value: dashboardData.stats.inProgress,
            icon: Clock,
          },
          {
            label: "Resolved",
            value: dashboardData.stats.resolved,
            icon: CheckCircle2,
          },
        ].map((s, i) => (
          <Card key={i} className="hover:shadow-2xl transition">
            <CardContent className="p-5">
              <s.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-black">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* QUICK ACTIONS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  label: "File Complaint",
                  href: "/citizen/complaints/new",
                  icon: FileText,
                },
                {
                  label: "Pay Bills",
                  href: "/citizen/payments",
                  icon: CreditCard,
                },
                {
                  label: "Request Service",
                  href: "/citizen/services",
                  icon: Sparkles,
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => router.push(a.href)}
                  className="p-6 border rounded-xl hover:bg-accent flex flex-col items-center gap-3"
                >
                  <a.icon className="w-6 h-6 text-primary" />
                  <span className="font-bold">{a.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* RECENT COMPLAINTS */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.complaints.length > 0 ? (
                dashboardData.complaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/citizen/complaints/${c.id}`)}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <p className="font-bold">
                      {c.title || "Untitled Complaint"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.submitted_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  No complaints yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* NOTICES */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" /> Ward Notices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.notices.length > 0 ? (
                dashboardData.notices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => router.push(`/citizen/notices/${n.id}`)}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <p className="font-bold text-sm">{n.title}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  No notices
                </p>
              )}
            </CardContent>
          </Card>

          {/* BILLS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Pending Bills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.bills.length > 0 ? (
                <>
                  {dashboardData.bills.map((b) => (
                    <div key={b.id} className="flex justify-between py-2">
                      <span>{b.description || "Utility Bill"}</span>
                      <span className="font-bold text-warning-amber">
                        NPR {b.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => router.push("/citizen/payments")}
                    className="mt-4 w-full py-3 bg-warning-amber text-white font-bold rounded-xl"
                  >
                    Pay Now
                  </button>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  All bills paid 🎉
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
