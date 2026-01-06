import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";


import { AssignmentPanel } from "@/app/(protected)/supervisor/complaints/_components/AssignmentPanel";

import { SLATracker } from "@/app/(protected)/supervisor/complaints/_components/SLATracker";
import { CommunicationThread } from "@/app/(protected)/supervisor/complaints/_components/CommunicationThread";
import { AttachmentsSection } from "@/app/(protected)/supervisor/complaints/_components/AttachmentsSection";
import { InternalNotes } from "@/app/(protected)/supervisor/complaints/_components/InternalNotes";
import { PriorityPanel } from "@/app/(protected)/supervisor/complaints/_components/PriorityPanel";
import { CitizenInfoPanel } from "@/app/(protected)/supervisor/complaints/_components/CitizenInfoPanel";
import { ComplaintDetailHeader } from "../_components/ComplaintDetailHeader";
import { StatusTimeline } from "../_components/StatusTimeline";

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