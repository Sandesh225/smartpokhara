import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import RegisterStaffForm from "@/components/admin/staff/RegisterStaffForm";

export default async function AdminStaffRegisterPage() {
  const user = await getCurrentUserWithRoles();
  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  const { data: wards } = await supabase
    .from("wards")
    .select("id, ward_number, name")
    .eq("is_active", true)
    .order("ward_number");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Staff"
        description="Create a new user account and immediately assign them to a department."
      />
      <div className="max-w-2xl mx-auto">
        <RegisterStaffForm
          departments={departments || []}
          wards={wards || []}
        />
      </div>
    </div>
  );
}
