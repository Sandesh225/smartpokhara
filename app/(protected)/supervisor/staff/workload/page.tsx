import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";
import { complaintsApi } from "@/features/complaints";
import { tasksApi } from "@/features/tasks/api";
import { WorkloadDistribution } from "../_components/WorkloadDistribution";
import { WorkloadCards } from "../_components/WorkloadCards";

export const dynamic = "force-dynamic";

export default async function WorkloadPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // 1. Fetch Staff List
  const staffList = await supervisorApi.getSupervisedStaff(
    supabase,
    user.id
  );
  const staffIds = staffList.map((s) => s.user_id);

  // 2. Fetch Assignments for each staff
  const staffAssignmentsResults = await Promise.all(
    staffList.map(async (staff) => {
      const assignments = await tasksApi.getStaffAssignments(supabase, staff.user_id);
      return { staffId: staff.user_id, assignments };
    })
  );

  // 3. Transform Data for UI
  const staffCardsData = staffList.map((staff) => {
    const result = staffAssignmentsResults.find(r => r.staffId === staff.user_id);
    const rawAssignments = result?.assignments || [];
    
    // Normalize to Assignment interface expected by WorkloadCards
    const normalizedAssignments = rawAssignments.map(a => ({
      id: a.id,
      type: a.type,
      label: a.tracking_code,
      title: a.title,
      priority: a.priority,
      status: a.status,
      deadline: a.due_at
    }));

    const currentLoad = normalizedAssignments.length;
    const maxLoad = staff.max_concurrent_assignments || 10;
    const percentage = Math.round((currentLoad / maxLoad) * 100);

    return {
      staffId: staff.user_id,
      name: staff.full_name || "Unknown Staff",
      photoUrl: staff.avatar_url,
      roleTitle: staff.role || "Staff",
      status: staff.availability_status || "offline",
      workloadPercentage: percentage,
      currentWorkload: currentLoad,
      maxWorkload: maxLoad,
      assignments: normalizedAssignments,
    };
  });

  const distributionData = staffCardsData.map((s) => ({
    staffId: s.staffId,
    name: s.name,
    workloadPercentage: s.workloadPercentage,
  }));

  // --- SERVER ACTIONS ---
  async function reassignItem(
    assignmentId: string,
    type: "complaint" | "task",
    toStaffId: string,
    fromStaffId?: string // <--- Add this parameter
  ) {
    "use server";
    const sb = await createClient();

    if (type === "complaint") {
      await complaintsApi.reassignComplaint(
        sb,
        assignmentId,
        toStaffId,
        "Workload Balancing",
        "Reassigned via Dashboard",
        user!.id,
        fromStaffId // <--- Pass it here
      );
    } else {
      await tasksApi.assignTask(sb, assignmentId, toStaffId);
    }
  }

  async function startChat(staffId: string) {
    "use server";
    redirect(`/supervisor/messages/new?staffId=${staffId}`);
  }
  return (
    <div className="space-y-6 p-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Workload Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rebalance assignments across your active team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4">
          <WorkloadDistribution staff={distributionData} />
        </div>
        <div className="lg:col-span-4">
          <WorkloadCards
            staffCards={staffCardsData}
            onReassign={reassignItem}
            onMessage={startChat} // Pass the action
            currentSupervisorId={user.id}
          />
        </div>
      </div>
    </div>
  );
}