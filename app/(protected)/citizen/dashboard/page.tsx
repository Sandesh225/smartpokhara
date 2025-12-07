// app/(protected)/citizen/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import {
  getUserDisplayName,
  getPrimaryRole,
  getRoleDisplayName,
} from "@/lib/auth/role-helpers";
import CitizenDashboardClient, {
  type RpcMyComplaint,
  type CitizenDashboardStats,
} from "@/components/citizen/CitizenDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CitizenDashboardPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    // You can redirect to login here if you prefer
    return null;
  }

  const supabase = await createClient();

  // Get user's complaints
  const { data: complaints = [] } = await supabase.rpc(
    "rpc_get_my_complaints",
    {
      p_status: null,
      p_limit: 50,
      p_offset: 0,
    }
  );

  const typedComplaints = (complaints as RpcMyComplaint[]) || [];

  // Get dashboard performance stats (response time, SLA, satisfaction)
  const { data: statsData } = await supabase.rpc("rpc_get_admin_dashboard");

  // Get user profile (for ward info, etc.)
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, ward:wards(ward_number, name)")
    .eq("user_id", user.id)
    .single();

  // Basic stats derived from complaints - safe for empty arrays
  const stats: CitizenDashboardStats = {
    totalComplaints: typedComplaints?.length || 0,
    pending:
      typedComplaints?.filter((c) =>
        ["submitted", "received", "assigned"].includes(c.status)
      ).length || 0,
    inProgress:
      typedComplaints?.filter((c) =>
        ["accepted", "in_progress"].includes(c.status)
      ).length || 0,
    resolved:
      typedComplaints?.filter((c) => ["resolved", "closed"].includes(c.status))
        .length || 0,
    overdue: typedComplaints?.filter((c) => c.is_overdue).length || 0,
  };

  const displayName = getUserDisplayName(user);
  const primaryRole = getPrimaryRole(user);
  const roleName = primaryRole ? getRoleDisplayName(primaryRole) : "Citizen";

  return (
    <CitizenDashboardClient
      userId={user.id}
      displayName={displayName}
      roleName={roleName}
      profile={profile}
      complaints={typedComplaints}
      stats={stats}
      statsData={statsData}
    />
  );
}