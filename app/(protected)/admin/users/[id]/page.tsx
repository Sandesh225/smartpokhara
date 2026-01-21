// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/users/[id]/page.tsx - USER DETAIL PAGE
// ═══════════════════════════════════════════════════════════

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { UserDetailsCard } from "@/app/(protected)/admin/users/_components/UserDetailsCard";
import { UserRolesCard } from "@/app/(protected)/admin/users/_components/UserRolesCard";
import { UserActivityCard } from "@/app/(protected)/admin/users/_components/UserActivityCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUserWithRoles();

  if (!currentUser || !isAdmin(currentUser)) {
    redirect("/login");
  }

  const supabase = await createClient();

  // ═══════════════════════════════════════════════════════════
  // FETCH TARGET USER WITH ALL RELATIONS
  // ═══════════════════════════════════════════════════════════
  const { data: user, error } = await supabase
    .from("users")
    .select(
      `
      *,
      user_profiles(*),
      user_roles!user_roles_user_id_fkey(
        id, role_id, assigned_by, assigned_at, is_primary,
        role:roles(*)
      ),
      staff_profiles(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-error-red/10">
          <User className="w-12 h-12 text-error-red" />
        </div>
        <h2 className="text-xl font-black text-foreground">User Not Found</h2>
        <p className="text-muted-foreground">
          The requested user could not be found.
        </p>
        <Link href="/admin/users">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // FETCH REFERENCE DATA FOR ROLE ASSIGNMENT DROPDOWNS
  // ═══════════════════════════════════════════════════════════
  const [rolesResult, deptsResult, wardsResult] = await Promise.all([
    supabase.from("roles").select("*").eq("is_active", true).order("role_type"),
    supabase
      .from("departments")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("wards")
      .select("id, ward_number, name")
      .eq("is_active", true)
      .order("ward_number"),
  ]);

  const displayName = user.user_profiles?.full_name || user.email;

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href="/admin/users">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter truncate">
            User Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5 truncate">
            System details for {displayName}
          </p>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN - Details & Activity */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <UserDetailsCard user={user} />
          <UserActivityCard userId={id} />
        </div>

        {/* RIGHT COLUMN - Roles & Permissions */}
        <div className="space-y-4 md:space-y-6">
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
