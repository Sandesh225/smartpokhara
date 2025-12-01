// app/(protected)/staff/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/role-helpers";
import { StaffSidebar } from "@/components/navigation/staff-sidebar";
import { StaffTopBar } from "@/components/navigation/StaffTopBar";

export default async function StaffLayout({ children }) {
  const user = await getCurrentUserWithRoles();

  // Check if user is logged in
  if (!user) {
    redirect("/login");
  }

  // Check if user has staff role
  if (!isStaff(user)) {
    redirect("/citizen/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <StaffSidebar user={user} />
      <div className="flex-1">
        <StaffTopBar user={user} />
        <main>{children}</main>
      </div>
    </div>
  );
}
