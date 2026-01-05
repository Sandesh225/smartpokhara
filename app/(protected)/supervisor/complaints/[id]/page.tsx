import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";

import { ComplaintDetailHeader } from "@/components/supervisor/complaints/ComplaintDetailHeader";
import { AssignmentPanel } from "@/components/supervisor/complaints/AssignmentPanel";
import { StatusTimeline } from "@/components/supervisor/complaints/StatusTimeline";
import { SLATracker } from "@/components/supervisor/complaints/SLATracker";
import { CommunicationThread } from "@/components/supervisor/complaints/CommunicationThread";
import { AttachmentsSection } from "@/components/supervisor/complaints/AttachmentsSection";
import { InternalNotes } from "@/components/supervisor/complaints/InternalNotes";
import { PriorityPanel } from "@/components/supervisor/complaints/PriorityPanel";
import { CitizenInfoPanel } from "@/components/supervisor/complaints/CitizenInfoPanel";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // 1. Fetch Main Data & Ancillary Data in Parallel for Performance
  const [complaintResult, notesResult, attachmentsResult] = await Promise.all([
    supervisorComplaintsQueries.getComplaintById(supabase, id),
    supervisorComplaintsQueries.getInternalNotes(supabase, id).catch(() => []),
    supervisorComplaintsQueries
      .getComplaintAttachments(supabase, id)
      .catch(() => ({ citizenUploads: [], staffUploads: [] })),
  ]);

  const { data: complaint, error } = complaintResult;

  if (error || !complaint) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Glass Header */}
      <ComplaintDetailHeader complaint={complaint} userId={user.id} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT COLUMN (Story & Context) */}
          <div className="xl:col-span-8 space-y-8">
            <AttachmentsSection
              citizenUploads={attachmentsResult.citizenUploads}
              staffUploads={attachmentsResult.staffUploads}
            />

            <CommunicationThread
              complaintId={complaint.id}
              initialMessages={complaint.updates || []}
              currentUserId={user.id}
            />

            <InternalNotes
              complaintId={complaint.id}
              initialNotes={notesResult}
            />

            <StatusTimeline history={complaint.history || []} />
          </div>

          {/* RIGHT COLUMN (Management & Metadata) */}
          <div className="xl:col-span-4 space-y-6">
            <SLATracker
              deadline={complaint.sla_due_at}
              status={complaint.status}
              createdAt={complaint.submitted_at}
            />

            <AssignmentPanel
              complaint={complaint}
              currentSupervisorId={user.id}
            />

            <PriorityPanel
              complaintId={complaint.id}
              currentPriority={complaint.priority}
            />

            <CitizenInfoPanel
              citizen={complaint.citizen}
              isAnonymous={complaint.is_anonymous}
            />
          </div>
        </div>
      </main>
    </div>
  );
}