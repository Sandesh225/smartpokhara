import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserDetailsCard } from "@/components/admin/UserDetailsCard";
import { UserRolesCard } from "@/components/admin/UserRolesCard";
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

  const { data: user, error } = await supabase
    .from("users")
    .select(
      `
      *,
      user_profiles(*),
      user_roles!user_roles_user_id_fkey(
        id, role_id, assigned_by, assigned_at, role:roles(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !user) {
    return <div className="p-8">User Not Found</div>;
  }

  // Only generic roles needed here
  const { data: availableRoles = [] } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .order("role_type");

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
          <UserRolesCard user={user} availableRoles={availableRoles || []} />
        </div>
      </div>
    </div>
  );
}