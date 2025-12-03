// ============================================================================
// FILE: app/(protected)/admin/staff/register/page.tsx
// Complete Staff Registration Page
// ============================================================================

import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import { RegisterStaffForm } from "@/components/admin/staff/RegisterStaffForm";

export const metadata = {
  title: "Register Staff | Admin Portal",
  description: "Register new staff members and assign roles",
};

export default async function RegisterStaffPage() {
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Register Staff Member
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create accounts and assign roles for new staff members
          </p>
        </div>

        <RegisterStaffForm />
      </div>
    </div>
  );
}
