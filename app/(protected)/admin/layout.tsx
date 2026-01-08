// app/(protected)/admin/layout.tsx - UPDATED
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import AdminNavigation from "@/components/admin/AdminNavigation";

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
    redirect("/citizen/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <main className="pl-60 pt-6">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
