// app/(protected)/layout.tsx - Fixed protected layout
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar user={user} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}
