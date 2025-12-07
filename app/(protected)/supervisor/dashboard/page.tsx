import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  isSupervisor,
  isAdmin,
  getUserDisplayName,
} from "@/lib/auth/role-helpers";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupervisorDashboardPage() {
  const user = await getCurrentUserWithRoles();

  if (!user) redirect("/login");
  if (!isSupervisor(user) && !isAdmin(user)) redirect("/citizen/dashboard");

  const supabase = await createClient();
  const displayName = getUserDisplayName(user);

  // 1. Get Supervisor's Department Info
  // If Admin, they see global stats, but for simplicity we assume supervisors focus on their dept
  let departmentId: string | null = null;

  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("department_id, department:departments(name)")
    .eq("user_id", user.id)
    .single();

  departmentId = staffProfile?.department_id;

  // 2. Fetch RPC Dashboard Summary
  // We utilize the SQL function we created earlier
  const { data: statsWrapper, error } = await supabase.rpc(
    "rpc_supervisor_get_dashboard_summary"
  );

  const stats = (statsWrapper as any)?.data || {
    total_complaints: 0,
    active_complaints: 0,
    overdue_complaints: 0,
    unassigned_complaints: 0,
    sla_compliance_rate: 0,
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {displayName}
          </h1>
          <p className="text-gray-500">
            {staffProfile?.department?.name
              ? `Department Head - ${staffProfile.department.name}`
              : "Supervisor Dashboard"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/supervisor/complaints">
            <Button>
              View Complaints Queue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Unassigned
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats.unassigned_complaints}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pending assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Active
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.active_complaints}
            </div>
            <p className="text-xs text-gray-500 mt-1">In progress & assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              SLA Breach
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue_complaints}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Team
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {/* This value comes from the RPC stats */}
              {(stats as any).total_staff || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active staff members</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
            <CardDescription>Quick actions for your department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Assignment Queue
                </h4>
                <p className="text-sm text-gray-500">
                  Assign new complaints to staff
                </p>
              </div>
              <Link href="/supervisor/complaints">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Team Workload</h4>
                <p className="text-sm text-gray-500">View staff performance</p>
              </div>
              {/* Future implementation */}
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-red-700">Priority Alerts</CardTitle>
            <CardDescription>Escalations needing your approval</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.overdue_complaints > 0 ? (
              <div className="text-center py-6">
                <AlertTriangle className="w-12 h-12 text-red-200 mx-auto mb-3" />
                <p className="font-medium text-red-900">
                  You have {stats.overdue_complaints} overdue items.
                </p>
                <Link href="/supervisor/complaints?filter=overdue">
                  <Button variant="destructive" className="mt-4">
                    Resolve Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
                <p>No critical alerts at this time.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
