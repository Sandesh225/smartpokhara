// app/(protected)/staff/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/role-helpers";
import { StaffSidebar } from "@/components/navigation/staff-sidebar";
import { StaffTopBar } from "@/components/navigation/StaffTopBar";

interface StaffLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: StaffLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  if (!isStaff(user)) {
    redirect("/citizen/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Staff Sidebar */}
      <StaffSidebar user={user} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Staff Top Bar */}
        <StaffTopBar user={user} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
