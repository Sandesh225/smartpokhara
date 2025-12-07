// app/(protected)/supervisor/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isSupervisor, isAdmin } from "@/lib/auth/role-helpers";
import SupervisorDashboardClient from "@/components/supervisor/SupervisorDashboardClient";

export default async function SupervisorDashboardPage() {
  const user = await getCurrentUserWithRoles();

  if (!user) redirect("/login");

  // Strict Check: Only Supervisor (Dept Head) or Admin
  if (!isSupervisor(user) && !isAdmin(user)) {
    redirect("/citizen/dashboard"); // Kick them out if they are just a citizen or normal staff
  }

  return <SupervisorDashboardClient user={user} />;
}
