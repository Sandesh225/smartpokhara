// FILE: app/(protected)/staff/queue/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { staffQueueQueries } from "@/lib/supabase/queries/staff-queue";
import { TaskDetailHeader } from "../_components/TaskDetailHeader";
import { TaskInfoCard } from "../_components/TaskInfoCard";
import { CitizenInfoPanel } from "../_components/CitizenInfoPanel";
import { WorkProgressTimeline } from "../_components/WorkProgressTimeline";
import { TaskActionBar } from "../_components/TaskActionBar";
import { StaffCommunication } from "../_components/StaffCommunication";
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
  const staffIdFromAuth = staff.user_id || staff.id;
  const assignmentStaffId = assignment.staff_id;

  const isAssignee = staffIdFromAuth === assignmentStaffId;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <TaskDetailHeader
        trackingId={assignment.tracking_code}
        status={assignment.status}
        priority={assignment.priority}
        title={assignment.title}
        isComplaint={assignment.type === "complaint"}
        backHref="/staff/queue"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Core Info */}
        <TaskInfoCard assignment={assignment} />

        {/* Citizen Info (If Complaint) */}
        {assignment.type === "complaint" && assignment.citizen && (
          <CitizenInfoPanel citizen={assignment.citizen} />
        )}

        {/* Timeline */}
        <WorkProgressTimeline
          created_at={assignment.assigned_at}
          started_at={assignment.started_at}
          completed_at={assignment.completed_at}
        />

        {/* ✅ REAL-TIME COMMUNICATION - Only for complaints */}
        {assignment.type === "complaint" && assignment.complaint_id && (
          <div className="mt-6">
            <StaffCommunication
              complaintId={assignment.complaint_id}
              currentUserId={staffIdFromAuth}
              isStaff={true}
            />
          </div>
        )}

        {/* Action Bar */}
        <TaskActionBar
          assignmentId={assignment.id}
          status={assignment.status}
          isAssignee={isAssignee}
          assigneeId={assignmentStaffId}
          staffId={staffIdFromAuth}
        />
      </div>
    </div>
  );
}
