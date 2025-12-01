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
  StaffUser,
} from "@/lib/types/complaints";

export const metadata = {
  title: "Complaints Management | Smart City Pokhara",
  description: "View and manage all citizen complaints",
};

export default async function AdminComplaintsPage() {
  const user = await getCurrentUserWithRoles();
  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  try {
    // Fetch filter options
    const [categoriesResult, departmentsResult, wardsResult, staffResult] =
      await Promise.all([
        supabase
          .from("complaint_categories")
          .select("id, name")
          .eq("is_active", true)
          .order("display_order"),

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

        supabase.rpc("get_staff_users_with_roles"),
      ]);

    const categories = (categoriesResult.data ?? []) as Category[];
    const departments = (departmentsResult.data ?? []) as Department[];
    const wards = (wardsResult.data ?? []) as Ward[];
    const staffUsers = (staffResult.data ?? []) as StaffUser[];

    return (
      <AdminComplaintsClient
        categories={categories}
        departments={departments}
        wards={wards}
        staffUsers={staffUsers}
        currentAdmin={user}
      />
    );
  } catch (error) {
    console.error("Error loading admin complaints page:", error);
    redirect("/admin/dashboard");
  }
}