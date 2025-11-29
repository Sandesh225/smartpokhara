// app/admin/complaints/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { AdminComplaintsClient } from "@/components/admin/admin-complaints-client";
import type {
  Category,
  Department,
  Ward,
  UserSummary,
} from "@/lib/types/complaints";

export const metadata = {
  title: "Complaints Management | Smart City Pokhara",
  description: "View and manage all citizen complaints",
};

export default async function AdminComplaintsPage() {
  const user = await getCurrentUserWithRoles();
  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  // Fetch filter options
  const { data: categoriesRaw = [] } = await supabase
    .from("complaint_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order");

  const categories = (categoriesRaw ?? []) as Category[];

  const { data: departmentsRaw = [] } = await supabase
    .from("departments")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  const departments = (departmentsRaw ?? []) as Department[];

  const { data: wardsRaw = [] } = await supabase
    .from("wards")
    .select("id, ward_number, name")
    .eq("is_active", true)
    .order("ward_number");

  const wards = (wardsRaw ?? []) as Ward[];

  // Fetch staff users for assignment
  const { data: roles = [] } = await supabase
    .from("roles")
    .select("id")
    .in("role_type", [
      "admin",
      "dept_head",
      "dept_staff",
      "field_staff",
      "ward_staff",
    ]);

  const roleIds = roles.map((r) => r.id);

  let staffUsers: UserSummary[] = [];

  if (roleIds.length > 0) {
    const { data: userRoles = [] } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role_id", roleIds);

    const userIds = Array.from(new Set(userRoles.map((ur) => ur.user_id)));

    if (userIds.length > 0) {
      const { data: staffUsersRaw = [] } = await supabase
        .from("users")
        .select("id, email, user_profiles(full_name)")
        .in("id", userIds)
        .eq("is_active", true);

      staffUsers = (staffUsersRaw ?? []) as UserSummary[];
    }
  }

  return (
    <AdminComplaintsClient
      categories={categories}
      departments={departments}
      wards={wards}
      staffUsers={staffUsers}
    />
  );
}
