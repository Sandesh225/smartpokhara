import { notFound, redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { StaffProfileCard } from "@/components/supervisor/staff/StaffProfileCard";
import { CurrentAssignments } from "@/components/supervisor/staff/CurrentAssignments";
import { ActivityTimeline } from "@/components/supervisor/staff/ActivityTimeline";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<any>; // Allow flexible params to debug
}

export default async function StaffDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  // Fallback: Check for 'staffId' OR 'id' depending on folder naming
  const staffId = resolvedParams.staffId || resolvedParams.id;

  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  if (!staffId) {
    console.error("Staff ID missing from route params:", resolvedParams);
    return notFound();
  }

  const supabase = await createClient();

  // 1. Fetch Data
  const [staff, assignments] = await Promise.all([
    supervisorStaffQueries.getStaffById(supabase, staffId),
    supervisorStaffQueries.getStaffAssignments(supabase, staffId)
  ]);

  // 2. Handle Not Found Gracefully
  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Staff Member Not Found</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          We couldn't find a staff profile with ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{staffId}</code>.
          They may have been deactivated or the link is incorrect.
        </p>
        <Link 
          href="/supervisor/staff"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Staff List
        </Link>
      </div>
    );
  }

  // 3. Normalize Data
  const unifiedAssignments = [
    ...(assignments.complaints || []).map((c: any) => ({
      id: c.id,
      type: 'complaint' as const,
      label: c.tracking_code,
      title: c.title,
      priority: c.priority,
      status: c.status,
      deadline: c.sla_due_at
    })),
    ...(assignments.tasks || []).map((t: any) => ({
      id: t.id,
      type: 'task' as const,
      label: t.tracking_code,
      title: t.title,
      priority: t.priority,
      status: t.status,
      deadline: t.due_date
    }))
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link 
          href="/supervisor/staff" 
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/supervisor/staff" className="hover:text-gray-900 transition-colors">
            Staff Management
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{staff.full_name}</span>
        </div>
      </div>

      <StaffProfileCard staff={staff} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CurrentAssignments assignments={unifiedAssignments} />
          <ActivityTimeline />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href={`/supervisor/staff/${staffId}/performance`} className="block w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-center font-medium transition-colors">
                View Performance
              </Link>
              <Link href={`/supervisor/messages/new?staffId=${staffId}`} className="block w-full py-2 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm text-center font-medium transition-colors">
                Send Message
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}