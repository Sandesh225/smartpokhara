// components/staff/dashboards/FieldStaffDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CurrentUser } from "@/lib/types/auth";

export function FieldStaffDashboard({ user }: FieldStaffDashboardProps) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load field technician tasks
    setLoading(false);
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Field Technician Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          View your assigned tasks and update work progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Assigned Tasks" value={0} description="Total assigned" color="blue" />
        <StatCard title="In Progress" value={0} description="Active work" color="yellow" />
        <StatCard title="Completed Today" value={0} description="Finished tasks" color="green" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Tasks</h3>
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            Your assigned tasks for today will appear here.
          </div>
          <Link href="/staff/field" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            Go to Field Work →
          </Link>
        </div>
      </div>
    </div>
  );
}