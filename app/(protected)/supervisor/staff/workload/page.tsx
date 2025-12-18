import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { supervisorTasksQueries } from "@/lib/supabase/queries/supervisor-tasks";
import { supervisorMessagesQueries } from "@/lib/supabase/queries/supervisor-messages";
import { WorkloadCards } from "@/components/supervisor/staff/WorkloadCards";
import { WorkloadDistribution } from "@/components/supervisor/staff/WorkloadDistribution";

export const dynamic = "force-dynamic";

export default async function WorkloadPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // FIX: Pass 'supabase' client as the first argument
  const staffList = await supervisorStaffQueries.getSupervisedStaff(supabase, user.id);
  
  const staffIds = staffList.map(s => s.user_id);

  const [workloadMetrics, allAssignments] = await Promise.all([
    supervisorStaffQueries.getTeamWorkload(supabase, staffIds),
    supervisorStaffQueries.getTeamAssignments(supabase, staffIds)
  ]);

  const staffCardsData = staffList.map(staff => {
    const assignments = allAssignments.filter((a: any) => a.staffId === staff.user_id);
    const currentLoad = assignments.length;
    const maxLoad = staff.max_concurrent_assignments || 10;
    const percentage = Math.round((currentLoad / maxLoad) * 100);

    return {
      staffId: staff.user_id,
      name: staff.full_name,
      photoUrl: staff.avatar_url,
      roleTitle: staff.role,
      status: staff.availability_status,
      workloadPercentage: percentage,
      currentWorkload: currentLoad,
      maxWorkload: maxLoad,
      assignments: assignments,
    };
  });

  const distributionData = staffCardsData.map(s => ({
    staffId: s.staffId,
    name: s.name,
    workloadPercentage: s.workloadPercentage
  }));

  async function reassignItem(id: string, type: 'complaint'|'task', toStaffId: string) {
    "use server";
    const sb = await createClient();
    if (type === 'complaint') {
      await supervisorComplaintsQueries.reassignComplaint(sb, id, toStaffId, "Workload Rebalancing", "Moved via Dashboard");
    } else {
      await supervisorTasksQueries.reassignTask(sb, id, toStaffId);
    }
  }

  async function startChat(staffId: string) {
    "use server";
    const sb = await createClient();
    const convId = await supervisorMessagesQueries.createConversation(sb, user!.id, staffId);
    redirect(`/supervisor/messages/${convId}`);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Workload Management</h1>
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50">
          Auto-Balance Workload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4">
          <WorkloadDistribution staff={distributionData} />
        </div>
        <div className="lg:col-span-4">
          <WorkloadCards 
            staffCards={staffCardsData} 
            onReassign={reassignItem}
            onMessage={startChat}
            currentSupervisorId={user.id}
          />
        </div>
      </div>
    </div>
  );
}