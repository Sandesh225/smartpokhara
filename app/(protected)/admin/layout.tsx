// app/(protected)/admin/layout.tsx - Fixed admin layout
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";

interface AdminLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user)) {
    // Redirect to their appropriate dashboard, not back to /dashboard
    redirect("/citizen/dashboard");
  }

  // Navbar comes from (protected)/layout.tsx, just wrap content
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
