import { notFound, redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";
import { staffApi } from "@/features/staff/api";
import { StaffProfileCard } from "@/app/(protected)/supervisor/staff/_components/StaffProfileCard";
import { CurrentAssignments } from "@/app/(protected)/supervisor/staff/_components/CurrentAssignments";
import { ActivityTimeline } from "@/app/(protected)/supervisor/staff/_components/ActivityTimeline";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ staffId: string }>;
}

export default async function StaffDetailPage({ params }: PageProps) {
  const { staffId } = await params;
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // 1. Fetch All Necessary Data
  const [profile, assignmentsData, attendanceOverview, pending_leaves] = await Promise.all([
    supervisorApi.getSupervisedStaff(supabase, user.id).then(list => list.find(s => s.user_id === staffId)),
    staffApi.getStaffAssignments(supabase, staffId),
    supervisorApi.getStaffAttendanceOverview(supabase, user.id).then(list => list.find(s => s.user_id === staffId)),
    staffApi.getPendingLeaves(supabase, [staffId])
  ]);

  if (!profile) return notFound();
  // attendance is from attendanceOverview now
  const attendance = attendanceOverview;

  // 2. Normalize Assignments
  const unifiedAssignments = [
    ...(assignmentsData.complaints || []).map((c: any) => ({
      id: c.id,
      type: "complaint" as const,
      label: c.tracking_code,
      title: c.title,
      priority: c.priority,
      status: c.status,
      deadline: c.sla_due_at,
    })),
    ...(assignmentsData.tasks || []).map((t: any) => ({
      id: t.id,
      type: "task" as const,
      label: t.tracking_code,
      title: t.title,
      priority: t.priority,
      status: t.status,
      deadline: t.due_date,
    })),
  ];

  // 3. Server Actions for Leave
  async function handleLeaveAction(leaveId: string, action: "approve" | "reject") {
    "use server";
    const sb = await createClient();
    if (action === "approve") {
      await supervisorApi.updateLeaveStatus(sb, leaveId, "approved", user!.id);
    } else {
      await supervisorApi.updateLeaveStatus(sb, leaveId, "rejected", user!.id);
    }
    redirect(`/supervisor/staff/${staffId}`);
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/supervisor/staff" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
          <p className="text-sm text-gray-500">{profile.ward_name || "HQ"} • {profile.staff_code}</p>
        </div>
      </div>

      <StaffProfileCard staff={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: Operations */}
        <div className="lg:col-span-2 space-y-6">
          <CurrentAssignments assignments={unifiedAssignments} />
          {/* Add Activity Timeline if you have the component */}
          <ActivityTimeline /> 
        </div>

        {/* RIGHT COL: Status & Actions */}
        <div className="space-y-6">
          
          {/* Attendance Status Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Today's Status
            </h3>
            {attendance?.attendance ? (
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-emerald-700 font-bold text-lg">
                  {attendance.attendance.check_out_time ? "Shift Completed" : "On Duty"}
                </p>
                <p className="text-emerald-600 text-xs mt-1">
                  Checked in at {format(new Date(attendance.attendance.check_in_time), "h:mm a")}
                </p>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-500 text-sm">
                Not checked in yet
              </div>
            )}
          </div>

          {/* Pending Leave Requests */}
          {pending_leaves.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm ring-1 ring-amber-100">
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Leave Requests
              </h3>
              <div className="space-y-3">
                {pending_leaves.map((leave: any) => (
                  <div key={leave.id} className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="block font-bold text-gray-900 capitalize">{leave.type}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d")}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic mb-3">"{leave.reason}"</p>
                    <div className="grid grid-cols-2 gap-2">
                      <form action={handleLeaveAction.bind(null, leave.id, "approve")}>
                        <button className="w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-xs font-bold transition-colors">
                          <CheckCircle className="h-3 w-3" /> Accept
                        </button>
                      </form>
                      <form action={handleLeaveAction.bind(null, leave.id, "reject")}>
                        <button className="w-full flex items-center justify-center gap-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-1.5 rounded text-xs font-bold transition-colors">
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/supervisor/messages/new?staffId=${staffId}`}
                className="block w-full py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm text-center font-medium transition-colors"
              >
                Send Message
              </Link>
              <Link
                href={`/supervisor/staff/${staffId}/performance`}
                className="block w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-center font-medium transition-colors text-gray-700"
              >
                View Performance
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}