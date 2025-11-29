// =============================================================================
// MISSING STAFF PORTAL COMPONENTS - ADD THESE TO YOUR PROJECT
// =============================================================================

// 1. components/staff/dashboards/SupervisorDashboard.tsx
// =============================================================================
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/types/auth";

interface SupervisorDashboardProps {
  user: CurrentUser;
}

export function SupervisorDashboard({ user }: SupervisorDashboardProps) {
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeComplaints: 0,
    overdueComplaints: 0,
    teamPerformance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupervisorData();
  }, [user.id]);

  async function loadSupervisorData() {
    const supabase = createClient();
    
    try {
      // Get department
      const { data: dept } = await supabase
        .from("departments")
        .select("id")
        .eq("head_user_id", user.id)
        .single();

      if (dept) {
        // Get department stats
        const [staffData, complaintsData] = await Promise.all([
          supabase
            .from("department_staff")
            .select("user_id")
            .eq("department_id", dept.id),
          supabase
            .from("complaints")
            .select("status, sla_due_at")
            .eq("assigned_department_id", dept.id)
        ]);

        const now = new Date();
        const overdue = complaintsData.data?.filter(c => 
          c.sla_due_at && new Date(c.sla_due_at) < now && 
          !["resolved", "closed"].includes(c.status)
        ).length || 0;

        setStats({
          totalStaff: staffData.data?.length || 0,
          activeComplaints: complaintsData.data?.filter(c => 
            !["resolved", "closed", "rejected"].includes(c.status)
          ).length || 0,
          overdueComplaints: overdue,
          teamPerformance: 85, // Calculate based on resolution metrics
        });
      }
    } catch (error) {
      console.error("Error loading supervisor data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Department Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor team performance and manage department operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Team Members" value={stats.totalStaff} color="blue" />
        <StatCard title="Active Cases" value={stats.activeComplaints} color="yellow" />
        <StatCard title="Overdue" value={stats.overdueComplaints} color="red" />
        <StatCard title="Performance" value={`${stats.teamPerformance}%`} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/staff/management" className="block text-sm font-medium text-blue-600 hover:text-blue-500">
              Manage Team →
            </Link>
            <Link href="/staff/complaints" className="block text-sm font-medium text-blue-600 hover:text-blue-500">
              Review Complaints →
            </Link>
            <Link href="/staff/analytics" className="block text-sm font-medium text-blue-600 hover:text-blue-500">
              View Analytics →
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Resolution Rate</span>
                <span>{stats.teamPerformance}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${stats.teamPerformance}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className={`rounded-lg border p-6 ${colors[color as keyof typeof colors]}`}>
      <dt className="text-sm font-medium">{title}</dt>
      <dd className="mt-2 text-3xl font-semibold">{value}</dd>
    </div>
  );
}