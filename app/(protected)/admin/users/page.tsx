// app/(protected)/admin/users/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { PageHeader } from "@/components/shared/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { UserTable } from "@/components/admin/user-table"; // ensure this file exists and exports UserTable

interface UsersPageSearchParams {
  page?: string;
  search?: string;
  role?: string;
  status?: string;
  verified?: string;
}

interface UsersPageProps {
  searchParams: UsersPageSearchParams;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user)) {
    redirect("/citizen/dashboard");
  }

  const supabase = await createClient();

  const page = Number(searchParams.page || "1");
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  // Base query
  let query = supabase
    .from("users")
    .select(
      `
      *,
      user_profiles(*),
      user_roles(
        *,
        role:roles(*)
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + itemsPerPage - 1);

  // Filters
  if (searchParams.search) {
    const search = searchParams.search;
    query = query.or(
      `email.ilike.%${search}%,user_profiles.full_name.ilike.%${search}%`
    );
  }

  if (searchParams.status === "active") {
    query = query.eq("is_active", true);
  } else if (searchParams.status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (searchParams.verified === "true") {
    query = query.eq("is_verified", true);
  } else if (searchParams.verified === "false") {
    query = query.eq("is_verified", false);
  }

  const { data: users = [], count = 0, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
  }

  const { data: roles = [] } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage system users and their roles"
        actions={
          <a
            href="/admin/users/new"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Add User
          </a>
        }
      />

      <UserTable
        users={users}
        totalCount={count}
        currentPage={page}
        itemsPerPage={itemsPerPage}
        searchParams={searchParams}
        roles={roles}
      />
    </div>
  );
}
