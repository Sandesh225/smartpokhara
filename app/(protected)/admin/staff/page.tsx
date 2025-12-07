import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/role-helpers";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import StaffList from "@/components/admin/staff/StaffList";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const user = await getCurrentUserWithRoles();
  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  // FIX: 'phone' is in the 'users' table, not 'user_profiles'
  // Also removed 'phone_number' from user_profiles query
  const { data: staff, error } = await supabase
    .from("staff_profiles")
    .select(
      `
      *,
      user:users(
        id, 
        email, 
        phone,
        last_login_at,
        user_profiles(full_name)
      ),
      department:departments(id, name, code),
      ward:wards(id, ward_number)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching staff:", error);
  }

  // Fetch departments for filtering
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage employees, assign departments, and configure roles."
        actions={
          <Link href="/admin/staff/register">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Register Staff
            </Button>
          </Link>
        }
      />

      <StaffList initialStaff={staff || []} departments={departments || []} />
    </div>
  );
}
