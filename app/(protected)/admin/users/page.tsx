// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/users/page.tsx - USERS MANAGEMENT PAGE
// ═══════════════════════════════════════════════════════════

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { UserTable } from "@/app/(protected)/admin/users/_components/user-table";

interface UsersPageSearchParams {
  page?: string;
  search?: string;
  role?: string;
  status?: string;
  verified?: string;
}

interface UsersPageProps {
  searchParams: Promise<UsersPageSearchParams>;
}

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: UsersPageProps) {
  // ═══════════════════════════════════════════════════════════
  // AUTHENTICATION & AUTHORIZATION
  // ═══════════════════════════════════════════════════════════
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user)) {
    redirect("/citizen/dashboard");
  }

  // ═══════════════════════════════════════════════════════════
  // SEARCH PARAMS & PAGINATION
  // ═══════════════════════════════════════════════════════════
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || "1"));
  const search = params.search?.trim() || "";
  const roleFilter = params.role || "";
  const status = params.status || "";
  const verified = params.verified || "";

  const supabase = await createClient();
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  // ═══════════════════════════════════════════════════════════
  // BUILD QUERY WITH FILTERS
  // ═══════════════════════════════════════════════════════════
  let query = supabase
    .from("users")
    .select(
      `
      *,
      user_profiles(*),
      user_roles!user_roles_user_id_fkey(
        *,
        role:roles(*)
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + itemsPerPage - 1);

  // Apply search filter (email or name)
  if (search) {
    // Search in email or user profile name
    query = query.or(
      `email.ilike.%${search}%,user_profiles.full_name.ilike.%${search}%`
    );
  }

  // Apply status filter
  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  // Apply verification filter
  if (verified === "true") {
    query = query.eq("is_verified", true);
  } else if (verified === "false") {
    query = query.eq("is_verified", false);
  }

  // Execute query
  const { data, count, error } = await query;

  if (error) {
    console.error("❌ Error fetching users:", error);
  }

  const users = data || [];

  // ═══════════════════════════════════════════════════════════
  // FETCH ROLES FOR FILTER DROPDOWN
  // ═══════════════════════════════════════════════════════════
  const { data: roles = [], error: rolesError } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (rolesError) {
    console.error("❌ Error fetching roles:", rolesError);
  }

  // ═══════════════════════════════════════════════════════════
  // FILTER BY ROLE (CLIENT-SIDE FILTER SINCE IT'S NESTED)
  // ═══════════════════════════════════════════════════════════
  let filteredUsers = users;

  if (roleFilter) {
    filteredUsers = users.filter((user) =>
      user.user_roles?.some((ur) => String(ur.role?.id) === roleFilter)
    );
  }

  // Recalculate count after role filtering
  const finalCount = roleFilter ? filteredUsers.length : count || 0;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-2 md:space-y-2 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      <UserTable
        users={filteredUsers}
        totalCount={finalCount}
        currentPage={page}
        itemsPerPage={itemsPerPage}
        searchParams={params}
        roles={roles}
      />
    </div>
  );
}
