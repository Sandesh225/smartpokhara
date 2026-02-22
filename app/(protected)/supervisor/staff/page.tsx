import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";
import { StaffGridView } from "@/app/(protected)/supervisor/staff/_components/StaffGridView";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffOverviewPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const staffList = await supervisorApi.getSupervisedStaff(supabase, user.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your team's status and performance.
          </p>
        </div>
        <Link
          href="/supervisor/staff/workload"
          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Manage Workload <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/supervisor/staff/management"
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground font-medium rounded-lg hover:bg-muted/50 shadow-xs transition-colors text-sm"
        >
          <Calendar className="h-4 w-4 text-primary" />
          Attendance & Leave Hub
        </Link>
      </div>

      <StaffGridView staffList={staffList} />
    </div>
  );
}
