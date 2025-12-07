// app/(protected)/supervisor/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isSupervisor, isAdmin } from "@/lib/auth/role-helpers";

interface SupervisorLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SupervisorLayout({
  children,
}: SupervisorLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  // Allow both dept_head (via isSupervisor) and admin to access supervisor portal
  const hasAccess = isSupervisor(user) || isAdmin(user);

  if (!hasAccess) {
    // Send unauthorized users to citizen dashboard instead of /dashboard
    redirect("/citizen/dashboard");
  }

  // Navbar is handled by parent (protected)/layout.tsx
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
