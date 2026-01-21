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

  // RBAC Check: Ensure Department Heads are included in isSupervisor check
  if (!isSupervisor(user) && !isAdmin(user)) {
    console.warn(
      `⛔ Access Denied: User ${user.id} attempted to access Supervisor Portal`
    );
    redirect("/citizen/dashboard");
  }

  const supabase = await createClient();

  // Parallel data fetching
  const [
    statsRes, // Fixed: Uses the consolidated RPC for jurisdictional counts
    notificationsRes,
    messagesRes,
    jurisdictionRes,
  ] = await Promise.all([
    // 1 & 2. Consolidated Complaint Stats (Uses the new SQL helper)
    supabase.rpc("get_supervisor_complaint_counts", {
      p_supervisor_id: user.id,
    }),

    // 3. Unread Notifications
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),

    // 4. Unread Messages (Custom RPC)
    supabase.rpc("rpc_get_unread_message_count", { p_user_id: user.id }),

    // 5. Jurisdiction Context for UI Labeling
    supabase
      .from("supervisor_profiles")
      .select("assigned_wards, assigned_departments, supervisor_level")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  // Logging errors for debugging
  if (statsRes.error) console.error("Stats Error:", statsRes.error);
  if (notificationsRes.error)
    console.error("Notification Error:", notificationsRes.error);

  const displayName = getUserDisplayName(user);

  // Extract stats from RPC response array
  const counts = statsRes.data?.[0] || {
    unassigned_count: 0,
    overdue_count: 0,
    active_count: 0,
  };

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
      // Assuming you have a way to fetch ward names, otherwise showing numbers
      jurisdictionLabel = `Ward ${assigned_wards.length} Officer`;
    }
  }

  return (
    <SupervisorLayoutClient
      user={user}
      displayName={displayName}
      jurisdictionLabel={jurisdictionLabel}
      badgeCounts={{
        unassigned: Number(counts.unassigned_count) || 0,
        overdue: Number(counts.overdue_count) || 0,
        notifications: notificationsRes.count ?? 0,
        messages: (messagesRes.data as number) ?? 0,
      }}
    >
      {children}
    </SupervisorLayoutClient>
  );
}