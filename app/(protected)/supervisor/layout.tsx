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

  // RBAC Check
  if (!isSupervisor(user) && !isAdmin(user)) {
    console.warn(
      `⛔ Access Denied: User ${user.id} attempted to access Supervisor Portal`
    );
    redirect("/citizen/dashboard");
  }

  const supabase = await createClient();

  // Parallel data fetching for UI badges
  const [
    unassignedRes,
    overdueRes,
    notificationsRes,
    messagesRes, // This now returns data from RPC
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

    // 3. Unread Notifications (Fixed: Points to public.notifications)
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id) // Changed from supervisor_id to user_id
      .eq("is_read", false),

    // 4. Unread Messages (Fixed: Uses RPC)
    supabase.rpc("rpc_get_unread_message_count", { p_user_id: user.id }),

    // 5. Jurisdiction Context
    supabase
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  // Optional logging
  if (unassignedRes.error) {
    console.error("Error fetching unassigned count:", unassignedRes.error);
  }
  if (overdueRes.error) {
    console.error("Error fetching overdue count:", overdueRes.error);
  }
  if (notificationsRes.error) {
    console.error(
      "Error fetching notifications count:",
      notificationsRes.error
    );
  }
  if (messagesRes.error) {
    console.error("Error fetching messages count:", messagesRes.error);
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
        // RPC returns the count directly in `data` property
        messages: (messagesRes.data as number) ?? 0,
      }}
    >
      {children}
    </SupervisorLayoutClient>
  );
}