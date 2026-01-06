import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserDetailsCard } from "@/components/admin/UserDetailsCard";
import { UserRolesCard } from "@/components/admin/UserRolesCard"; // We will update this next
import { UserActivityCard } from "@/components/admin/UserActivityCard";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUserWithRoles();

  if (!currentUser || !isAdmin(currentUser)) redirect("/login");

  const supabase = await createClient();

  // 1. Fetch Target User
  const { data: user, error } = await supabase
    .from("users")
    .select(
      `
      *,
      user_profiles(*),
      user_roles!user_roles_user_id_fkey(
        id, role_id, assigned_by, assigned_at, role:roles(*)
      ),
      staff_profiles(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !user) {
    return <div className="p-8">User Not Found</div>;
  }

  // 2. Fetch Reference Data for Dropdowns
  const [rolesResult, deptsResult, wardsResult] = await Promise.all([
    supabase.from("roles").select("*").eq("is_active", true).order("role_type"),
    supabase.from("departments").select("id, name, code").eq("is_active", true),
    supabase
      .from("wards")
      .select("id, ward_number, name")
      .eq("is_active", true)
      .order("ward_number"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description={`System details for ${
          user.user_profiles?.full_name || user.email
        }`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <UserDetailsCard user={user} />
          <UserActivityCard userId={id} />
        </div>

        <div className="space-y-6">
          {/* Pass all necessary data to the client component */}
          <UserRolesCard
            user={user}
            availableRoles={rolesResult.data || []}
            departments={deptsResult.data || []}
            wards={wardsResult.data || []}
          />
        </div>
      </div>
    </div>
  );
}