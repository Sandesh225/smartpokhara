// app/(protected)/staff/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import {
  isWardStaff,
  isDeptStaff,
  isFieldStaff,
  isSupervisor,
  isHelpdesk,
} from "@/lib/auth/role-helpers";

// Import dashboard components
import { WardStaffDashboard } from "@/components/staff/dashboards/WardStaffDashboard";
import { DeptStaffDashboard } from "@/components/staff/dashboards/DeptStaffDashboard";
import { FieldStaffDashboard } from "@/components/staff/dashboards/FieldStaffDashboard";
import { SupervisorDashboard } from "@/components/staff/dashboards/SupervisorDashboard";
import { HelpdeskDashboard } from "@/components/staff/dashboards/HelpdeskDashboard";
import { DefaultStaffDashboard } from "@/components/staff/dashboards/DefaultStaffDashboard";

export default async function StaffDashboardPage() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  // Show appropriate dashboard based on role (priority order)
  if (isSupervisor(user)) {
    return <SupervisorDashboard user={user} />;
  }

  if (isWardStaff(user)) {
    return <WardStaffDashboard user={user} />;
  }

  if (isDeptStaff(user)) {
    return <DeptStaffDashboard user={user} />;
  }

  if (isFieldStaff(user)) {
    return <FieldStaffDashboard user={user} />;
  }

  if (isHelpdesk(user)) {
    return <HelpdeskDashboard user={user} />;
  }

  // Default dashboard for any other staff roles
  return <DefaultStaffDashboard user={user} />;
}