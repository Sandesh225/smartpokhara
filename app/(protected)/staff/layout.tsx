import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff, isAdmin } from "@/lib/auth/role-helpers";
import { StaffShell } from "@/components/staff/StaffShell";

interface StaffLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: StaffLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  // Security Check: Only staff or admin can see this layout
  if (!isStaff(user) && !isAdmin(user)) {
    redirect("/citizen/dashboard");
  }

  return <StaffShell user={user}>{children}</StaffShell>;
}
