// app/(protected)/staff/layout.tsx - Fixed staff layout
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/role-helpers";

interface StaffLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffLayout({ children }: StaffLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  if (!isStaff(user)) {
    // Redirect to citizen dashboard, not back to /dashboard
    redirect("/citizen/dashboard");
  }

  // Navbar comes from (protected)/layout.tsx, just wrap content
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
