//app/(protected)/admin/staff/register/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import RegisterStaffForm from "@/components/admin/staff/RegisterStaffForm";

export default async function AdminStaffRegisterPage() {
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/unauthorized");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Register Staff Member</h1>
          <p className="text-gray-600">
            Create accounts and assign roles for new staff members
          </p>
        </div>
        <RegisterStaffForm />
      </div>
    </div>
  );
}
