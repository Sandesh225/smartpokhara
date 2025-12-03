// app/(protected)/admin/workload/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { WorkloadDashboard } from "@/components/admin/workload-dashboard";

export const metadata = {
  title: "Staff Workload | Smart City Pokhara",
  description: "Monitor team capacity and assignment distribution",
};

export default async function WorkloadPage() {
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/login");
  }

  return <WorkloadDashboard />;
}