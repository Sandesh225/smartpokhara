// app/(protected)/admin/staff/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";
import StaffList from "@/components/admin/staff/StaffList";

export default async function AdminStaffPage() {
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) {
    redirect("/unauthorized");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all registered staff members.
          </p>
        </div>

        <Link
          href="/admin/staff/register"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Register New Staff
        </Link>
      </div>

      {/* Actual staff list (client component that calls Supabase) */}
      <StaffList />
    </div>
  );
}
