// =============================================================================
// COMPLETE ADMIN USER MANAGEMENT SYSTEM
// =============================================================================

// 1. app/(protected)/admin/users/[id]/page.tsx
// =============================================================================
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserDetailsCard } from "@/components/admin/UserDetailsCard";
import { UserRolesCard } from "@/components/admin/UserRolesCard";
import { UserActivityCard } from "@/components/admin/UserActivityCard";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUserWithRoles();

  if (!currentUser || !isAdmin(currentUser)) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Fetch user details
  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      user_profiles(*),
      user_roles(
        id,
        role_id,
        assigned_by,
        assigned_at,
        expires_at,
        role:roles(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !user) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Not Found" />
        <p className="text-gray-500">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Fetch available roles
  const { data: availableRoles = [] } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .order("role_type");

  // Fetch departments for assignment
  const { data: departments = [] } = await supabase
    .from("departments")
    .select("*")
    .eq("is_active", true)
    .order("name");

  // Fetch wards for assignment
  const { data: wards = [] } = await supabase
    .from("wards")
    .select("*")
    .eq("is_active", true)
    .order("ward_number");

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description={`Managing ${user.user_profiles?.full_name || user.email}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - User details */}
        <div className="lg:col-span-2 space-y-6">
          <UserDetailsCard user={user} />
          <UserActivityCard userId={id} />
        </div>

        {/* Right column - Roles & permissions */}
        <div className="space-y-6">
          <UserRolesCard
            user={user}
            availableRoles={availableRoles}
            departments={departments}
            wards={wards}
          />
        </div>
      </div>
    </div>
  );
}
