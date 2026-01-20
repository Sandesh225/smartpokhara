// app/(protected)/admin/layout.tsx
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
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      {/* 
        Responsive layout:
        - Mobile: pt-14 (below mobile header), no left padding
        - md: md:pl-56 (sidebar width)
        - lg: lg:pl-64 (larger sidebar width)
      */}
      <main className="pt-14 md:pt-0 md:pl-56 lg:pl-64 min-h-screen">
        <div className="w-full max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
