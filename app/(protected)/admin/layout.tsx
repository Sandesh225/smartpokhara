// ============================================================================
// app/(protected)/admin/layout.tsx - Admin Layout Wrapper
// ============================================================================

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { AdminShell } from "@/components/admin/shell/AdminShell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUserWithRoles();

  // Guard: must be logged in AND admin
  if (!user || !isAdmin(user)) {
    redirect("/login");
  }

  const primaryRoleType = (user.roles && user.roles[0]?.role_type) || "admin";

  return (
    <AdminShell
      user={{
        full_name: user.full_name,
        email: user.email,
        avatar_url: (user as any).avatar_url,
        roleType: primaryRoleType,
      }}
    >
      {children}
    </AdminShell>
  );
}
