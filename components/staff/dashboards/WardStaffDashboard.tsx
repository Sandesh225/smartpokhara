// components/staff/dashboards/WardStaffDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CurrentUser } from "@/lib/types/auth";
import { createClient } from "@/lib/supabase/client";

interface WardStaffDashboardProps {
  user: CurrentUser;
}

interface DashboardStats {
  totalComplaints: number;
  newToday: number;
  openCount: number;
  inProgressCount: number;
  overdueCount: number;
}

export function WardStaffDashboard({ user }: WardStaffDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    newToday: 0,
    openCount: 0,
    inProgressCount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const supabase = createClient();
      
      try {
        // Get user's ward ID from profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("ward_id")
          .eq("user_id", user.id)
          .single();

        if (!profile?.ward_id) {
          setLoading(false);
          return;
        }

        // Get complaint statistics for the ward
        const { data: complaints, error } = await supabase
          .from("complaints")
          .select("status, submitted_at, sla_due_at")
          .eq("ward_id", profile.ward_id);

        if (error) throw error;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const stats = {
          totalComplaints: complaints?.length || 0,
          newToday: complaints?.filter(c => 
            new Date(c.submitted_at) >= today
          ).length || 0,
          openCount: complaints?.filter(c => 
            ["submitted", "received", "assigned"].includes(c.status)
          ).length || 0,
          inProgressCount: complaints?.filter(c => 
            c.status === "in_progress"
          ).length || 0,
          overdueCount: complaints?.filter(c => 
            c.sla_due_at && new Date(c.sla_due_at) < now && 
            !["resolved", "closed", "rejected"].includes(c.status)
          ).length || 0,
        };

        setStats(stats);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Ward Staff Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Ward Staff Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage complaints and coordinate field work for your ward.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          description="All time"
          color="blue"
        />
        <StatCard
          title="New Today"
          value={stats.newToday}
          description="Requires attention"
          color="green"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressCount}
          description="Being addressed"
          color="yellow"
        />
        <StatCard
          title="Overdue"
          value={stats.overdueCount}
          description="SLA breached"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Complaints */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/staff/complaints?status=submitted"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">
                View New Complaints
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                {stats.newToday}
              </span>
            </Link>
            <Link
              href="/staff/complaints?overdue=true"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">
                View Overdue Complaints
              </span>
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                {stats.overdueCount}
              </span>
            </Link>
            <Link
              href="/staff/complaints"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">
                Manage All Complaints
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                {stats.totalComplaints}
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              Recent updates and notifications will appear here.
            </div>
            {/* Placeholder for recent activity feed */}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  description, 
  color 
}: { 
  title: string;
  value: number;
  description: string;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <dt className="text-sm font-medium">{title}</dt>
      <dd className="mt-2 text-3xl font-semibold">{value}</dd>
      <dd className="text-sm opacity-75">{description}</dd>
    </div>
  );
}