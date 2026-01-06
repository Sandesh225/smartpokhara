import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { StaffGridView } from "@/app/(protected)/supervisor/staff/_components/StaffGridView";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffOverviewPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const staffList = await supervisorStaffQueries.getSupervisedStaff(
    supabase,
    user.id
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500">
            Overview of your team's status and performance.
          </p>
        </div>
        <Link
          href="/supervisor/staff/workload"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Manage Workload <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <StaffGridView staffList={staffList} />
    </div>
  );
}
