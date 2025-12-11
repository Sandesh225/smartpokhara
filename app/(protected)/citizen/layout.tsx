// app/(protected)/citizen/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import {
  getUserDisplayName,
  getPrimaryRole,
  getRoleDisplayName,
} from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import CitizenLayoutClient from "./CitizenLayoutClient";

type CitizenLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CitizenLayout({ children }: CitizenLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get unread counts for badges
  const [complaintsResult, notificationsResult] = await Promise.all([
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .in("status", ["submitted", "received", "assigned"]),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  const displayName = getUserDisplayName(user);
  const primaryRole = getPrimaryRole(user);
  const roleName = primaryRole ? getRoleDisplayName(primaryRole) : "Citizen";

  return (
    <CitizenLayoutClient
      user={{
        id: user.id,
        email: user.email,
        displayName,
        roleName,
        roles: user.roles,
        profile: user.profile,
      }}
      initialCounts={{
        complaints: complaintsResult.count || 0,
        notifications: notificationsResult.count || 0,
      }}
    >
      {children}
    </CitizenLayoutClient>
  );
}
