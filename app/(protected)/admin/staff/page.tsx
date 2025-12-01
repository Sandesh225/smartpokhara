// app/(protected)/admin/staff/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { InviteStaffDialog } from "@/components/admin/staff/InviteStaffDialog";
import { BulkInviteDialog } from "@/components/admin/staff/BulkInviteDialog";
import { StaffInvitationsTable } from "@/components/admin/staff/StaffInvitationsTable";
import { StaffListTable } from "@/components/admin/staff/StaffListTable";
import { Users, UserPlus, Mail, Upload, Shield } from "lucide-react";

export default function StaffManagementPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const tab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"staff" | "invitations">(
    (tab as any) || "staff"
  );
  const [showInviteDialog, setShowInviteDialog] = useState(action === "invite");
  const [showBulkDialog, setShowBulkDialog] = useState(action === "bulk");
  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingInvitations: 0,
    activeStaff: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const supabase = createClient();

    try {
      // Get staff roles
      const { data: staffRoles } = await supabase
        .from("roles")
        .select("id")
        .in("role_type", ["admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"]);

      const roleIds = staffRoles?.map(r => r.id) || [];

      // Count total staff
      const { count: staffCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .in("role_id", roleIds);

      // Count pending invitations
      const { count: pendingCount } = await supabase
        .from("staff_invitations")
        .select("*", { count: "exact", head: true })
        .eq("is_used", false)
        .gt("expires_at", new Date().toISOString());

      // Count active staff
      const { data: activeUsers } = await supabase
        .from("user_roles")
        .select(`user_id, users!inner(is_active)`)
        .in("role_id", roleIds)
        .eq("users.is_active", true);

      setStats({
        totalStaff: staffCount || 0,
        pendingInvitations: pendingCount || 0,
        activeStaff: activeUsers?.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage staff members and send invitations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowInviteDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Invite Staff Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Staff
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalStaff}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Active Staff
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.activeStaff}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Pending Invitations
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.pendingInvitations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("staff")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "staff"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            All Staff
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "invitations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Invitations
            {stats.pendingInvitations > 0 && (
              <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                {stats.pendingInvitations}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "staff" ? (
        <StaffListTable onRefresh={loadStats} />
      ) : (
        <StaffInvitationsTable onRefresh={loadStats} />
      )}

      {/* Dialogs */}
      {showInviteDialog && (
        <InviteStaffDialog
          onClose={() => setShowInviteDialog(false)}
          onSuccess={() => {
            setShowInviteDialog(false);
            loadStats();
            setActiveTab("invitations");
          }}
        />
      )}

      {showBulkDialog && (
        <BulkInviteDialog
          onClose={() => setShowBulkDialog(false)}
          onSuccess={() => {
            setShowBulkDialog(false);
            loadStats();
            setActiveTab("invitations");
          }}
        />
      )}
    </div>
  );
}