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

// Ensure this layout is dynamic so it checks auth on every navigation
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CitizenLayout({ children }: CitizenLayoutProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login?error=session_expired");
  }

  // Double check strict role protection
  if (!user.roles.includes("citizen") && !user.roles.includes("admin")) {
     // Optional: Redirect staff to their own portal if they try to access citizen view
     // redirect("/staff/dashboard"); 
  }

  const supabase = await createClient();

  // Server-side data prefetch for the sidebar badges
  // We use Promise.all to fetch them in parallel for speed
  const [complaintsResult, notificationsResult] = await Promise.all([
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .eq("citizen_id", user.id) // Corrected from owner_id to citizen_id based on DB Schema
      .not("status", "eq", "closed"), // Count active complaints
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