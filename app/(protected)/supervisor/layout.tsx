import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import {
  isSupervisor,
  isAdmin,
  getUserDisplayName,
} from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { SupervisorLayoutClient } from "./SupervisorLayoutClient";

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
    redirect("/login?redirect=/supervisor/dashboard");
  }

  // RBAC Check (keep behavior)
  if (!isSupervisor(user) && !isAdmin(user)) {
    console.warn(
      `⛔ Access Denied: User ${user.id} attempted to access Supervisor Portal`
    );
    redirect("/citizen/dashboard");
  }

  const supabase = await createClient();

  // Parallel data fetching for UI badges (preserve queries)
  const [
    unassignedRes,
    overdueRes,
    notificationsRes,
    messagesRes,
    jurisdictionRes,
  ] = await Promise.all([
    // 1. Unassigned Complaints
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .is("assigned_staff_id", null)
      .in("status", ["received"]),

    // 2. Overdue Complaints
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .lt("sla_due_at", new Date().toISOString())
      .not("status", "in", '("resolved","closed")'),

    // 3. Unread Notifications
    supabase
      .from("supervisor_notifications")
      .select("id", { count: "exact", head: true })
      .eq("supervisor_id", user.id)
      .eq("is_read", false),

    // 4. Unread Messages
    supabase
      .from("supervisor_staff_messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false),

    // 5. Jurisdiction Context
    supabase
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  // Optional logging (doesn't change contracts)
  if (unassignedRes.error) {
    console.error(
      "Error fetching unassigned complaints count:",
      unassignedRes.error
    );
  }
  if (overdueRes.error) {
    console.error("Error fetching overdue complaints count:", overdueRes.error);
  }
  if (notificationsRes.error) {
    console.error(
      "Error fetching supervisor notifications count:",
      notificationsRes.error
    );
  }
  if (messagesRes.error) {
    console.error(
      "Error fetching supervisor messages count:",
      messagesRes.error
    );
  }
  if (jurisdictionRes.error) {
    console.error(
      "Error fetching supervisor jurisdiction:",
      jurisdictionRes.error
    );
  }

  const displayName = getUserDisplayName(user);

  // Format Jurisdiction Label
  let jurisdictionLabel = "General Supervisor";
  if (jurisdictionRes.data) {
    const { assigned_wards, assigned_departments, supervisor_level } =
      jurisdictionRes.data;

    if (supervisor_level === "senior") {
      jurisdictionLabel = "Senior Supervisor (City-wide)";
    } else if (assigned_departments && assigned_departments.length > 0) {
      // In production, you'd map IDs to names. For now, assume generic label
      jurisdictionLabel = "Department Head";
    } else if (assigned_wards && assigned_wards.length > 0) {
      jurisdictionLabel = `Ward ${assigned_wards.join(", ")} Officer`;
    }
  }

  return (
    <SupervisorLayoutClient
      user={user}
      displayName={displayName}
      jurisdictionLabel={jurisdictionLabel}
      badgeCounts={{
        unassigned: unassignedRes.count ?? 0,
        overdue: overdueRes.count ?? 0,
        notifications: notificationsRes.count ?? 0,
        messages: messagesRes.count ?? 0,
      }}
    >
      {children}
    </SupervisorLayoutClient>
  );
}
