// components/staff/dashboards/DeptStaffDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipboardList, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { CurrentUser } from "@/lib/types/auth";

export function DeptStaffDashboard({ user }: { user: CurrentUser }) {
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const supabase = createClient();

    // Load stats
    // TODO: Replace with actual RPC calls
    const { data: complaints } = await supabase
      .from("complaints")
      .select("*")
      .eq("assigned_to", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (complaints) {
      setRecentComplaints(complaints);
      setStats({
        assigned: complaints.length,
        inProgress: complaints.filter((c) => c.status === "in_progress").length,
        completed: complaints.filter((c) => c.status === "resolved").length,
        overdue: complaints.filter((c) => c.is_overdue).length,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Department Staff Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user.profile?.full_name || user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Assigned to Me
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.assigned}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Progress
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.inProgress}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.completed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overdue
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.overdue}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            My Recent Complaints
          </h3>
          <div className="space-y-3">
            {recentComplaints.length === 0 ? (
              <p className="text-sm text-gray-500">
                No complaints assigned yet
              </p>
            ) : (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{complaint.tracking_code}
                    </p>
                    <p className="text-sm text-gray-500">{complaint.title}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      complaint.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : complaint.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}