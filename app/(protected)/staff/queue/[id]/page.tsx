import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
import { TaskDetailHeader } from "@/components/staff/task-detail/TaskDetailHeader";
import { TaskInfoCard } from "@/components/staff/task-detail/TaskInfoCard";
import { CitizenInfoPanel } from "@/components/staff/task-detail/CitizenInfoPanel";
import { WorkProgressTimeline } from "@/components/staff/task-detail/WorkProgressTimeline";
import { TaskActionBar } from "@/components/staff/task-detail/TaskActionBar"; 
import { getCurrentUserWithRoles } from "@/lib/auth/session";


export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Auth Check (Server-Side)
  const staff = await getCurrentUserWithRoles();
  if (!staff) redirect("/login");

  const supabase = await createClient();
  
  // 2. Fetch Assignment
  const assignment = await staffQueueQueries.getAssignmentById(supabase, id);

  if (!assignment) {
    return notFound();
  }

  // 3. Determine View Mode (Assignee vs Viewer)
  // CRITICAL FIX: Ensure IDs are strings and match exactly
  const staffIdFromAuth = staff.user_id || staff.id;
  const assignmentStaffId = assignment.staff_id;
  
  const isAssignee = staffIdFromAuth === assignmentStaffId;

  // Debugging (Uncomment if still having issues)
  // console.log(`Auth ID: ${staffIdFromAuth}, Assigned ID: ${assignmentStaffId}, Match: ${isAssignee}`);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <TaskDetailHeader 
        trackingId={assignment.tracking_code}
        status={assignment.status}
        priority={assignment.priority}
        title={assignment.title}
        isComplaint={assignment.type === 'complaint'}
        backHref="/staff/queue"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Core Info */}
        <TaskInfoCard assignment={assignment} />

        {/* Citizen Info (If Complaint) */}
        {assignment.type === 'complaint' && assignment.citizen && (
          <CitizenInfoPanel citizen={assignment.citizen} />
        )}

        {/* Timeline */}
        <WorkProgressTimeline 
          created_at={assignment.assigned_at} 
          started_at={assignment.started_at} 
          completed_at={assignment.completed_at}
        />

        {/* Action Bar */}
        <TaskActionBar 
          assignmentId={assignment.id} 
          status={assignment.status} 
          isAssignee={isAssignee}
          assigneeId={assignmentStaffId}
          staffId={staffIdFromAuth} // Pass current user for uploads
        />

      </div>
    </div>
  );
}