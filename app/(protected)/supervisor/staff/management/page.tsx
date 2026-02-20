import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";
import { staffApi } from "@/features/staff/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, UserCheck, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AttendanceTable } from "@/components/staff/AttendanceTable";
import { LeaveRequestList } from "@/components/staff/LeaveRequestList";


export const dynamic = "force-dynamic";

export default async function StaffManagementPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  
  // 1. Get Team & IDs
  const team = await supervisorApi.getSupervisedStaff(supabase, user.id);
  const staffIds = team.map(s => s.user_id);

  // 2. Fetch Data
  const [attendanceList, pendingLeaves] = await Promise.all([
    supervisorApi.getStaffAttendanceOverview(supabase, user.id),
    staffApi.getPendingLeaves(supabase, staffIds)
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/supervisor/staff" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
             <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Personnel Oversight</h1>
            <p className="text-sm text-gray-500">
              Manage live attendance and approve leave requests.
            </p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Supervisor Access</span>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="bg-gray-100/50 p-1 border border-gray-200">
          <TabsTrigger value="attendance" className="gap-2"><UserCheck className="h-4 w-4" /> Live Attendance</TabsTrigger>
          <TabsTrigger value="leaves" className="gap-2">
            <Calendar className="h-4 w-4" /> Leave Requests
            {pendingLeaves.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">{pendingLeaves.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTable staff={attendanceList} />
        </TabsContent>

        <TabsContent value="leaves" className="mt-6">
          <LeaveRequestList initialLeaves={pendingLeaves} supervisorId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}