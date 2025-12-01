// components/staff/dashboards/FieldStaffDashboard.tsx
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
  CheckCircle,
  Navigation,
  Calendar,
  FileText,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FieldStaffDashboardProps {
  user: CurrentUser;
}

interface FieldStats {
  totalAssignments: number;
  pending: number;
  inProgress: number;
  completed: number;
  onSiteToday: number;
}

interface TodayAssignment {
  id: string;
  scheduled_date: string;
  status: string;
  assignment_type: string;
  complaint: {
    id: string;
    tracking_code: string | null;
    title: string;
    priority: string | null;
    location_address: string | null;
    ward: {
      ward_number: number | null;
    } | null;
  } | null;
}

export function FieldStaffDashboard({ user }: FieldStaffDashboardProps) {
  const [stats, setStats] = useState<FieldStats | null>(null);
  const [todayAssignments, setTodayAssignments] = useState<TodayAssignment[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadDashboardData = async () => {
    const supabase = createClient();

    try {
      // Fetch stats using RPC
      const { data: statsData, error: statsError } = await supabase.rpc(
        "get_field_staff_stats",
        {
          p_staff_id: user.id,
        }
      );

      if (statsError) throw statsError;
      if (statsData) setStats(statsData as FieldStats);

      // Fetch today's tasks
      const todayStr = new Date().toISOString().split("T")[0];

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("field_assignments")
        .select(
          `
          id,
          complaint:complaints(
            id,
            tracking_code,
            title,
            priority,
            location_address,
            ward:wards(ward_number)
          ),
          scheduled_date,
          status,
          assignment_type
        `
        )
        .eq("assigned_staff_id", user.id)
        .gte("scheduled_date", `${todayStr}T00:00:00`)
        .lte("scheduled_date", `${todayStr}T23:59:59`)
        .order("scheduled_date", { ascending: true });

      if (assignmentsError) throw assignmentsError;

      setTodayAssignments((assignmentsData || []) as TodayAssignment[]);
    } catch (err) {
      console.error("Error loading field staff dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalAssignments = stats?.totalAssignments ?? 0;
  const todayVisits = stats?.onSiteToday ?? 0;
  const inProgress = stats?.inProgress ?? 0;
  const completed = stats?.completed ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          Field Technician Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          View your tasks, assignments, and work progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assignments"
          value={totalAssignments}
          description="All assignments"
          icon={FileText}
          tone="blue"
        />
        <StatCard
          title="Today's Visits"
          value={todayVisits}
          description="Scheduled for today"
          icon={Calendar}
          tone="yellow"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          description="Active work"
          icon={Wrench}
          tone="green"
        />
        <StatCard
          title="Completed"
          value={completed}
          description="Finished work"
          icon={CheckCircle}
          tone="red"
        />
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAssignments.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Your assignments for today will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {todayAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-sm font-medium">
                        {assignment.complaint?.title ?? "Field assignment"}
                      </h3>

                      {assignment.complaint?.priority && (
                        <Badge
                          variant={
                            assignment.complaint.priority === "high"
                              ? "destructive"
                              : assignment.complaint.priority === "medium"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {assignment.complaint.priority}
                        </Badge>
                      )}

                      <Badge variant="outline" className="capitalize">
                        {assignment.assignment_type}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {assignment.complaint?.location_address || "No address"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Ward {assignment.complaint?.ward?.ward_number ?? "N/A"} •{" "}
                      Scheduled:{" "}
                      {new Date(assignment.scheduled_date).toLocaleTimeString()}
                      {assignment.complaint?.tracking_code && (
                        <>
                          {" • Code: "}
                          {assignment.complaint.tracking_code}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        assignment.status === "completed"
                          ? "default"
                          : assignment.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {assignment.status.replace(/_/g, " ")}
                    </Badge>

                    <Button size="sm" variant="outline">
                      <Navigation className="mr-1 h-4 w-4" />
                      Navigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button variant="outline" className="h-16 w-full">
              <MapPin className="mr-2 h-4 w-4" />
              Map View
            </Button>

            <Link href="/staff/field" className="w-full">
              <Button variant="outline" className="h-16 w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
            </Link>

            <Button variant="outline" className="h-16 w-full">
              <Wrench className="mr-2 h-4 w-4" />
              Tools
            </Button>

            <Link href="/staff/reports/field" className="w-full">
              <Button variant="outline" className="h-16 w-full">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
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
  value: number | string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "yellow" | "red";
}) {
  const toneClasses: Record<"blue" | "green" | "yellow" | "red", string> = {
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
        <div className="h-6 w-64 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-80 rounded bg-gray-100" />
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
