// components/staff/dashboards/DeptStaffDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CurrentUser } from "@/lib/types/auth";
import type { Database } from "@/lib/types/database.types";

type Complaint = Database['public']['Tables']['complaints']['Row'] & {
  complaint_categories?: { name: string };
  user_profiles?: { full_name: string };
  wards?: { ward_number: number };
};

interface DeptStaffDashboardProps {
  user: CurrentUser;
}

export function DeptStaffDashboard({ user }: DeptStaffDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, []);

  const loadComplaints = async () => {
    const supabase = createClient();
    
    try {
      // Get user's department
      const { data: deptData } = await supabase
        .from("department_staff")
        .select("department_id")
        .eq("user_id", user.id)
        .single();

      if (!deptData) return;

      // Get complaints assigned to department
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          complaint_categories(name),
          user_profiles(full_name),
          wards(ward_number)
        `)
        .eq("assigned_department_id", deptData.department_id)
        .in("status", ["assigned", "in_progress"])
        .order("submitted_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error loading complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const supabase = createClient();
    
    try {
      const { data: deptData } = await supabase
        .from("department_staff")
        .select("department_id")
        .eq("user_id", user.id)
        .single();

      if (!deptData) return;

      const { data, error } = await supabase
        .from("complaints")
        .select("status")
        .eq("assigned_department_id", deptData.department_id);

      if (error) throw error;

      const complaints = data || [];
      setStats({
        total: complaints.length,
        assigned: complaints.filter(c => c.status === "assigned").length,
        inProgress: complaints.filter(c => c.status === "in_progress").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaintId);

      if (error) throw error;

      // Reload complaints
      loadComplaints();
      loadStats();
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Department Staff Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Department Staff Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage department complaints and track resolution progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Complaints</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Assigned</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.assigned}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.inProgress}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.resolved}</dd>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Complaints</h3>
          <p className="mt-1 text-sm text-gray-500">Complaints assigned to your department</p>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {complaints.map((complaint) => (
            <li key={complaint.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        complaint.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.tracking_code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {complaint.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {complaint.status === "assigned" && (
                      <button
                        onClick={() => updateComplaintStatus(complaint.id, "in_progress")}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Start Work
                      </button>
                    )}
                    {complaint.status === "in_progress" && (
                      <button
                        onClick={() => updateComplaintStatus(complaint.id, "resolved")}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Category: {complaint.complaint_categories?.name}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Ward: {complaint.wards?.ward_number || 'N/A'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Submitted {new Date(complaint.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {complaints.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="text-sm text-gray-500">No complaints assigned to your department</div>
          </div>
        )}
      </div>
    </div>
  );
}