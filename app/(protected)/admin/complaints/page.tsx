// app/(protected)/admin/complaints/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { AdminComplaintsClient } from "@/components/admin/admin-complaints-client";

export const metadata = {
  title: "Complaints Management | Admin",
  description: "View and manage all citizen complaints",
};

export default async function AdminComplaintsPage() {
  const user = await getCurrentUserWithRoles();
  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  // Filter options
  const { data: categories = [] } = await supabase
    .from("complaint_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order");

  const { data: departments = [] } = await supabase
    .from("departments")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  const { data: wards = [] } = await supabase
    .from("wards")
    .select("id, ward_number, name")
    .eq("is_active", true)
    .order("ward_number");

  // Staff users (admin, dept_head, dept_staff, field_staff, ward_staff)
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

  const { data: userRoles = [] } = await supabase
    .from("user_roles")
    .select("user_id")
    .in("role_id", roleIds);

  const userIds = Array.from(new Set(userRoles.map((ur) => ur.user_id)));

  const { data: staffUsers = [] } = await supabase
    .from("users")
    .select("id, email, user_profiles(full_name)")
    .in("id", userIds)
    .eq("is_active", true);

  return (
    <AdminComplaintsClient
      categories={categories}
      departments={departments}
      wards={wards}
      staffUsers={staffUsers}
    />
  );
}
