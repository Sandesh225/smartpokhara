
// 2. components/staff/dashboards/HelpdeskDashboard.tsx
// =============================================================================
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/types/auth";

interface HelpdeskDashboardProps {
  user: CurrentUser;
}

export function HelpdeskDashboard({ user }: HelpdeskDashboardProps) {
  const [stats, setStats] = useState({
    callsToday: 0,
    complaintsCreated: 0,
    avgHandlingTime: 0,
  });

  useEffect(() => {
    loadHelpdeskStats();
  }, [user.id]);

  async function loadHelpdeskStats() {
    const supabase = createClient();
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("complaints")
        .select("created_at")
        .eq("source", "call_center")
        .gte("created_at", today.toISOString());

      setStats({
        callsToday: data?.length || 0,
        complaintsCreated: data?.length || 0,
        avgHandlingTime: 5.2, // Calculate from actual data
      });
    } catch (error) {
      console.error("Error loading helpdesk stats:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Helpdesk Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage citizen calls and create complaints on their behalf.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard title="Calls Today" value={stats.callsToday} color="blue" />
        <StatCard title="Complaints Created" value={stats.complaintsCreated} color="green" />
        <StatCard title="Avg. Handling Time" value={`${stats.avgHandlingTime} min`} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              href="/staff/helpdesk?tab=create" 
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">Create New Complaint</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link 
              href="/staff/helpdesk?tab=search" 
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">Search Complaints</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className={`rounded-lg border p-6 ${colors[color as keyof typeof colors]}`}>
      <dt className="text-sm font-medium">{title}</dt>
      <dd className="mt-2 text-3xl font-semibold">{value}</dd>
    </div>
  );
}
