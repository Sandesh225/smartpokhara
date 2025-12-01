// components/staff/dashboards/SupervisorDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/types/auth";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SupervisorDashboardProps {
  user: CurrentUser;
}

interface SupervisorStats {
  teamSize: number;
  totalComplaints: number;
  teamWorkload: number;
  overdue: number;
  resolutionRate: number;
  avgTeamPerformance: number;
}

interface TeamMemberPerformance {
  staff_id: string;
  staff_name: string;
  role_type: string;
  active_tasks: number;
  completed_this_week: number;
  performance_score: number;
}

export function SupervisorDashboard({ user }: SupervisorDashboardProps) {
  const [stats, setStats] = useState<SupervisorStats | null>(null);
  const [teamPerformance, setTeamPerformance] = useState<
    TeamMemberPerformance[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadDashboardData = async () => {
    const supabase = createClient();

    try {
      // Get supervisor stats via RPC
      const { data: statsData, error: statsError } = await supabase.rpc(
        "get_supervisor_stats",
        {
          p_supervisor_id: user.id,
        }
      );
      if (statsError) throw statsError;
      if (statsData) {
        setStats(statsData as SupervisorStats);
      }

      // Find department where this user is head (merge first version idea)
      const { data: dept, error: deptError } = await supabase
        .from("departments")
        .select("id")
        .eq("head_user_id", user.id)
        .single();

      if (deptError && deptError.code !== "PGRST116") {
        // ignore "row not found" style errors; log others
        console.error("Error loading supervisor department:", deptError);
      }

      const departmentId = dept?.id ?? null;

      // Get team performance (optionally by department)
      const { data: performanceData, error: performanceError } =
        await supabase.rpc("get_team_performance", {
          p_department_id: departmentId,
        });

      if (performanceError) throw performanceError;
      setTeamPerformance((performanceData || []) as TeamMemberPerformance[]);
    } catch (error) {
      console.error("Error loading supervisor dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const teamSize = stats?.teamSize ?? 0;
  const teamWorkload = stats?.teamWorkload ?? 0;
  const overdue = stats?.overdue ?? 0;
  const resolutionRate = stats?.resolutionRate ?? 0;
  const avgTeamPerformance = stats?.avgTeamPerformance ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          Supervisor Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor team performance and manage departmental operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Size"
          value={teamSize}
          description="Staff members"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Team Workload"
          value={teamWorkload}
          description="Active complaints"
          icon={FileText}
          tone="yellow"
        />
        <StatCard
          title="Overdue"
          value={overdue}
          description="Past due date"
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          description="Success rate"
          icon={TrendingUp}
          tone="green"
        />
      </div>

      {/* Overall Team Performance Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Average Performance</span>
              <span className="font-medium">
                {avgTeamPerformance.toFixed
                  ? avgTeamPerformance.toFixed(1)
                  : avgTeamPerformance}
                %
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${Math.min(Math.max(avgTeamPerformance, 0), 100)}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamPerformance.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No team performance data available.
            </div>
          ) : (
            <div className="space-y-4">
              {teamPerformance.map((member) => (
                <div
                  key={member.staff_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">
                        {member.staff_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {member.role_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {member.active_tasks}
                      </div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {member.completed_this_week}
                      </div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${
                          member.performance_score >= 80
                            ? "text-green-600"
                            : member.performance_score >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {member.performance_score}%
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Management Tools / Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Management Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link href="/staff/management" className="w-full">
              <Button variant="outline" className="h-16 w-full">
                <Users className="mr-2 h-4 w-4" />
                Team Management
              </Button>
            </Link>
            <Link href="/staff/analytics" className="w-full">
              <Button variant="outline" className="h-16 w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/staff/reports" className="w-full">
              <Button variant="outline" className="h-16 w-full">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href="/staff/settings" className="w-full">
              <Button variant="outline" className="h-16 w-full">
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
          <div className="h-5 w-48 rounded bg-gray-100" />
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
