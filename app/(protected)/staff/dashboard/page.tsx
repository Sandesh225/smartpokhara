// app/(protected)/staff/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import {
  isWardStaff,
  isDeptStaff,
  isFieldStaff,
  isSupervisor,
  isHelpdesk,
  hasRole,
} from "@/lib/auth/role-helpers";
import { WardStaffDashboard } from "@/components/staff/dashboards/WardStaffDashboard";
import { DeptStaffDashboard } from "@/components/staff/dashboards/DeptStaffDashboard";
import { FieldStaffDashboard } from "@/components/staff/dashboards/FieldStaffDashboard";
import { SupervisorDashboard } from "@/components/staff/dashboards/SupervisorDashboard";
import { HelpdeskDashboard } from "@/components/staff/dashboards/HelpdeskDashboard";

export default async function StaffDashboardPage() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  // Render appropriate dashboard based on primary role
  if (isWardStaff(user)) {
    return <WardStaffDashboard user={user} />;
  }

  if (isDeptStaff(user)) {
    return <DeptStaffDashboard user={user} />;
  }

  if (isFieldStaff(user)) {
    return <FieldStaffDashboard user={user} />;
  }

  if (isSupervisor(user)) {
    return <SupervisorDashboard user={user} />;
  }

  if (isHelpdesk(user)) {
    return <HelpdeskDashboard user={user} />;
  }

  // Default fallback
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          Staff Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to the staff portal. Your role does not have a specific
          dashboard configured.
        </p>
      </div>
    </div>
  );
}
