import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { getDashboardType } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { UnifiedShell } from "@/components/layout/protected/UnifiedShell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const dashboardType = getDashboardType(user);

  // Fetch global counts (Notifications & Overdue/Unassigned tasks if applicable)
  const [notifRes, complaintsRes] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
    supabase.from("complaints").select("id", { count: "exact", head: true }).eq("citizen_id", user.id).neq("status", "resolved")
  ]);

  const counts = {
    notifications: notifRes.count || 0,
    complaints: complaintsRes.count || 0,
    unassigned: 0, // Populate via RPC if supervisor
    messages: 0, 
  };

  return (
    <UnifiedShell user={user} dashboardType={dashboardType} counts={counts}>
      {children}
    </UnifiedShell>
  );
}
