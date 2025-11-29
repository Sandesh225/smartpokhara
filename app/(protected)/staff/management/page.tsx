// app/(protected)/staff/management/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type StaffMember = {
  id: string;
  email: string;
  user_profiles: { full_name: string } | null;
  user_roles: { roles: { role_type: string; name: string } }[];
  department_staff?: { departments: { name: string } }[];
  complaints_assigned: number;
  complaints_resolved: number;
  avg_resolution_days: number;
};

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    loadStaff();
  }, [departmentFilter]);

  async function loadStaff() {
    const supabase = createClient();
    
    try {
      // Get staff members (excluding citizens and tourists)
      let query = supabase
        .from("users")
        .select(`
          id,
          email,
          user_profiles(full_name),
          user_roles!inner(
            roles!inner(
              role_type,
              name
            )
          ),
          department_staff(
            departments(name)
          )
        `)
        .neq("user_roles.roles.role_type", "citizen")
        .neq("user_roles.roles.role_type", "tourist")
        .neq("user_roles.roles.role_type", "business_owner");

      const { data: staffData, error } = await query;

      if (error) throw error;

      // Get performance metrics for each staff member
      const staffWithMetrics = await Promise.all(
        (staffData || []).map(async (staffMember) => {
          const { data: complaints } = await supabase
            .from("complaints")
            .select("status, submitted_at, resolved_at")
            .eq("assigned_staff_id", staffMember.id);

          const assigned = complaints?.length || 0;
          const resolved = complaints?.filter(c => c.status === "resolved").length || 0;
          
          // Calculate average resolution time
          const resolvedComplaints = complaints?.filter(c => c.resolved_at) || [];
          const totalResolutionTime = resolvedComplaints.reduce((acc, complaint) => {
            const submitted = new Date(complaint.submitted_at);
            const resolved = new Date(complaint.resolved_at!);
            return acc + (resolved.getTime() - submitted.getTime());
          }, 0);
          const avgResolutionDays = resolvedComplaints.length > 0 
            ? totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)
            : 0;

          return {
            ...staffMember,
            complaints_assigned: assigned,
            complaints_resolved: resolved,
            avg_resolution_days: avgResolutionDays,
          };
        })
      );

      // Apply department filter
      let filteredStaff = staffWithMetrics;
      if (departmentFilter) {
        filteredStaff = staffWithMetrics.filter(member =>
          member.department_staff?.some(ds => 
            ds.departments.name.toLowerCase().includes(departmentFilter.toLowerCase())
          )
        );
      }

      setStaff(filteredStaff);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
          <p className="mt-2 text-sm text-gray-600">Loading staff information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          View staff performance metrics and manage team assignments.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Filter by Department
            </label>
            <input
              type="text"
              id="department"
              placeholder="Enter department name..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDepartmentFilter("")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((staffMember) => (
          <div key={staffMember.id} className="rounded-lg border border-gray-200 bg-white p-6">
            {/* Staff Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {staffMember.user_profiles?.full_name || "No Name"}
                </h3>
                <p className="text-sm text-gray-500">{staffMember.email}</p>
                <p className="text-sm text-gray-500">
                  {staffMember.user_roles[0]?.roles.name || "No Role"}
                </p>
                {staffMember.department_staff?.[0] && (
                  <p className="text-sm text-blue-600">
                    {staffMember.department_staff[0].departments.name}
                  </p>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {staffMember.complaints_assigned}
                </div>
                <div className="text-xs text-gray-500">Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {staffMember.complaints_resolved}
                </div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Resolution Rate</span>
                <span>
                  {staffMember.complaints_assigned > 0
                    ? Math.round((staffMember.complaints_resolved / staffMember.complaints_assigned) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{
                    width: `${
                      staffMember.complaints_assigned > 0
                        ? (staffMember.complaints_resolved / staffMember.complaints_assigned) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Average Resolution Time */}
            {staffMember.avg_resolution_days > 0 && (
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-500">
                  Avg. Resolution: {staffMember.avg_resolution_days.toFixed(1)} days
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <div className="text-sm text-gray-500">
            {departmentFilter 
              ? `No staff members found in "${departmentFilter}" department`
              : "No staff members found"}
          </div>
        </div>
      )}
    </div>
  );
}