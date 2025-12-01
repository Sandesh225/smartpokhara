import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { EnhancedAdminDashboard } from "@/components/admin/enhanced-admin-dashboard";

export const metadata = {
  title: "Admin Dashboard | Smart City Pokhara",
  description: "Overview of complaints and system performance",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/login");
  }

  return <EnhancedAdminDashboard />;
}
