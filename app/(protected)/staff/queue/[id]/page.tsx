// FILE: app/(protected)/staff/queue/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { staffApi } from "@/features/staff/api";
import { TaskDetailHeader } from "../_components/TaskDetailHeader";
import { TaskInfoCard } from "../_components/TaskInfoCard";
import { CitizenInfoPanel } from "../_components/CitizenInfoPanel";
import { WorkProgressTimeline } from "../_components/WorkProgressTimeline";
import { TaskActionBar } from "../_components/TaskActionBar";
import { getCurrentUserWithRoles } from "@/lib/auth/session";

// REAL-TIME COMMUNICATION COMPONENT
import { UniversalMessaging } from "@/components/complaints/shared/UniversalMessaging";

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
  // Note: This assumes staffApi.getAssignmentById returns the flattened 'complaint_id'
  const assignment = await staffApi.getAssignmentById(supabase, id);
  if (!assignment) return notFound();

  // 3. Determine View Mode & IDs
  const currentUserId = staff.id;
  const assignmentStaffId = assignment.staff_id;
  const isAssignee = currentUserId === assignmentStaffId;

  // Extract the REAL Complaint ID for the communication component
  // If the assignment type isn't a complaint, this remains null
  const realComplaintId = assignment.type === "complaint" ? assignment.complaint_id : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section */}
      <TaskDetailHeader
        trackingId={assignment.tracking_code}
        status={assignment.status}
        priority={assignment.priority}
        title={assignment.title}
        isComplaint={assignment.type === "complaint"}
        backHref="/staff/queue"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Core Task Information */}
        <TaskInfoCard assignment={{
            ...assignment, 
            location: assignment.location || "",
            instructions: assignment.instructions || undefined 
        }} />

        {/* Citizen Information Panel (Visible only for complaints) */}
        {assignment.type === "complaint" && assignment.citizen && (
          <CitizenInfoPanel citizen={assignment.citizen} />
        )}

        {/* Work Progress Timeline */}
        <WorkProgressTimeline
          created_at={assignment.assigned_at}
          started_at={assignment.started_at || undefined}
          completed_at={assignment.completed_at || undefined}
        />

        {/* Floating/Bottom Action Bar */}
        <TaskActionBar
          assignmentId={assignment.id}
          status={assignment.status}
          isAssignee={isAssignee}
          assigneeId={assignmentStaffId}
          staffId={currentUserId}
        />

        {/* ----------------------------- */}
        {/* Communication Section (Chat) */}
        {/* ----------------------------- */}
        {/* We only render the chat if it's a complaint and we have a valid complaint ID */}
        {assignment.type === "complaint" && realComplaintId && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-black tracking-tight text-foreground mb-4">Communication History</h3>
            <div className="h-[600px] border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                <UniversalMessaging
                    channelType="COMPLAINT_PUBLIC"
                    channelId={realComplaintId}
                    currentUserId={currentUserId}
                    currentUserRole="staff"
                    variant="default" // Using default variant for staff
                    title="Complaint Discussion"
                    subtitle="Public comments visible to citizen"
                    className="h-full border-0"
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}