import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { PageHeader } from "@/components/shared/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { UserTable } from "@/components/admin/user-table";

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

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user)) {
    redirect("/citizen/dashboard");
  }

  const params = await searchParams;
  const page = Number(params.page || "1");
  const search = params.search || "";
  const status = params.status || "";
  const verified = params.verified || "";

  const supabase = await createClient();
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  // FIXED: Added !user_roles_user_id_fkey to disambiguate the relationship
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

  // Filters
  if (search) {
    query = query.ilike("email", `%${search}%`);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (verified === "true") {
    query = query.eq("is_verified", true);
  } else if (verified === "false") {
    query = query.eq("is_verified", false);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
  }

  const users = data || [];

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
        totalCount={count || 0}
        currentPage={page}
        itemsPerPage={itemsPerPage}
        searchParams={params}
        roles={roles || []}
      />
    </div>
  );
}
