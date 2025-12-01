// components/staff/dashboards/WardStaffDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CurrentUser } from "@/lib/types/auth";
import { createClient } from "@/lib/supabase/client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface WardStaffDashboardProps {
  user: CurrentUser;
}

interface WardStats {
  totalComplaints: number;
  newToday: number;
  openCount: number;
  inProgressCount: number;
  overdueCount: number;
}

interface RecentComplaint {
  id: string;
  tracking_code: string | null;
  title: string;
  status: string;
  priority: string | null;
  submitted_at: string;
  category?: {
    name: string | null;
  } | null;
  citizen?: {
    full_name: string | null;
  } | null;
}

export function WardStaffDashboard({ user }: WardStaffDashboardProps) {
  const [stats, setStats] = useState<WardStats>({
    totalComplaints: 0,
    newToday: 0,
    openCount: 0,
    inProgressCount: 0,
    overdueCount: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [noWard, setNoWard] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      const supabase = createClient();

      try {
        // Get user's ward ID from profile
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("ward_id")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile?.ward_id) {
          setNoWard(true);
          return;
        }

        // Fetch complaints for this ward (stats + recent list from same query)
        const { data: complaints, error: complaintsError } = await supabase
          .from("complaints")
          .select(
            `
            id,
            tracking_code,
            title,
            status,
            priority,
            submitted_at,
            sla_due_at,
            category:complaint_categories(name),
            citizen:user_profiles!complaints_citizen_id_fkey(full_name)
          `
          )
          .eq("ward_id", profile.ward_id)
          .order("submitted_at", { ascending: false });

        if (complaintsError) throw complaintsError;

        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const totalComplaints = complaints?.length || 0;

        const newToday =
          complaints?.filter((c) => {
            const submitted = new Date(c.submitted_at);
            return submitted >= today;
          }).length || 0;

        const openCount =
          complaints?.filter((c) =>
            ["submitted", "received", "assigned"].includes(c.status)
          ).length || 0;

        const inProgressCount =
          complaints?.filter((c) => c.status === "in_progress").length || 0;

        const overdueCount =
          complaints?.filter((c) => {
            if (!c.sla_due_at) return false;
            const due = new Date(c.sla_due_at);
            return (
              due < now &&
              !["resolved", "closed", "rejected"].includes(c.status)
            );
          }).length || 0;

        setStats({
          totalComplaints,
          newToday,
          openCount,
          inProgressCount,
          overdueCount,
        });

        setRecentComplaints((complaints || []).slice(0, 10));
      } catch (error) {
        console.error("Error loading ward dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user.id]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (noWard) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">
            Ward Staff Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your user profile is not linked to a ward yet. Please contact the
            system administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          Ward Staff Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage complaints and coordinate field work for your ward.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          description="All time"
          icon={FileText}
          tone="blue"
        />
        <StatCard
          title="New Today"
          value={stats.newToday}
          description="Requires attention"
          icon={Activity}
          tone="green"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressCount}
          description="Being addressed"
          icon={TrendingUp}
          tone="yellow"
        />
        <StatCard
          title="Overdue"
          value={stats.overdueCount}
          description="SLA breached"
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      {/* Recent Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recent Ward Complaints
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No complaints in your ward yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-sm font-medium">{complaint.title}</h3>
                      {complaint.priority && (
                        <Badge
                          variant={
                            complaint.priority === "high"
                              ? "destructive"
                              : complaint.priority === "medium"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {complaint.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {complaint.category?.name || "Uncategorized"} •{" "}
                      {complaint.citizen?.full_name || "Unknown citizen"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(complaint.submitted_at).toLocaleDateString()}{" "}
                      {complaint.tracking_code && (
                        <>• Code: {complaint.tracking_code}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        complaint.status === "resolved"
                          ? "default"
                          : complaint.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {complaint.status.replace(/_/g, " ")}
                    </Badge>
                    <Link href={`/staff/complaints/${complaint.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                href="/staff/complaints?status=submitted"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                <span>View New Complaints</span>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {stats.newToday}
                </span>
              </Link>
              <Link
                href="/staff/complaints?overdue=true"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                <span>View Overdue Complaints</span>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                  {stats.overdueCount}
                </span>
              </Link>
              <Link
                href="/staff/complaints"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                <span>Manage All Complaints</span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  {stats.totalComplaints}
                </span>
              </Link>

              {/* Extra ward tools from your first version */}
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Link href="/staff/complaints/new">
                  <Button
                    variant="outline"
                    className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs"
                  >
                    <FileText className="h-4 w-4" />
                    <span>New Complaint</span>
                  </Button>
                </Link>
                <Link href="/staff/ward/residents">
                  <Button
                    variant="outline"
                    className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs"
                  >
                    <Users className="h-4 w-4" />
                    <span>Ward Residents</span>
                  </Button>
                </Link>
                <Link href="/staff/ward/map">
                  <Button
                    variant="outline"
                    className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Ward Map</span>
                  </Button>
                </Link>
                <Link href="/staff/reports">
                  <Button
                    variant="outline"
                    className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Reports</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Recent updates and notifications will appear here.
              {/* You can later wire this to an activity log table or audit trail. */}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "yellow" | "red";
}) {
  const toneClasses: Record<typeof tone, string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <Card className={toneClasses[tone]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 opacity-75" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs opacity-75">{description}</p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="border-b border-gray-200 pb-5">
        <div className="h-6 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-64 rounded bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border bg-white p-6">
            <div className="mb-2 h-4 w-24 rounded bg-gray-100" />
            <div className="h-8 w-16 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-40 rounded bg-gray-100" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-100" />
                  <div className="h-3 w-32 rounded bg-gray-100" />
                  <div className="h-3 w-24 rounded bg-gray-100" />
                </div>
                <div className="ml-4 h-8 w-16 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
