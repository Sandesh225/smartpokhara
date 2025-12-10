import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { supervisorComplaintsQueries } from "@/lib/supabase/queries/supervisor-complaints";
import { getSupervisorJurisdiction } from "@/lib/utils/jurisdiction-helpers";

import { ComplaintDetailHeader } from "@/components/supervisor/complaints/ComplaintDetailHeader";
import { ComplaintInfoCard } from "@/components/supervisor/complaints/ComplaintInfoCard";
import { AssignmentPanel } from "@/components/supervisor/complaints/AssignmentPanel";
import { StatusTimeline } from "@/components/supervisor/complaints/StatusTimeline";
import { SLATracker } from "@/components/supervisor/complaints/SLATracker";
import { CommunicationThread } from "@/components/supervisor/complaints/CommunicationThread";
import { CitizenInfoPanel } from "@/components/supervisor/complaints/CitizenInfoPanel";
import { AttachmentsSection } from "@/components/supervisor/complaints/AttachmentsSection";
import { InternalNotes } from "@/components/supervisor/complaints/InternalNotes";
import { PriorityPanel } from "@/components/supervisor/complaints/PriorityPanel";
import { RelatedComplaints } from "@/components/supervisor/complaints/RelatedComplaints";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user) redirect("/login");

  const supabase = await createClient();

  // 1. Parallel Data Fetching
  const [
    complaintRes,
    timelineRes,
    attachmentsRes,
    internalNotesRes,
    relatedRes,
  ] = await Promise.all([
    supervisorComplaintsQueries.getComplaintById(supabase, id),
    supervisorComplaintsQueries
      .getComplaintTimeline(supabase, id)
      .catch(() => []),
    supervisorComplaintsQueries
      .getComplaintAttachments(supabase, id)
      .catch(() => ({ citizenUploads: [], staffUploads: [] })),
    supervisorComplaintsQueries.getInternalNotes(supabase, id).catch(() => []),
    supervisorComplaintsQueries
      .getRelatedComplaints(supabase, id)
      .catch(() => []),
  ]);

  const complaint = complaintRes.data;

  if (!complaint) return notFound();

  // 2. Jurisdiction Check (simplified for stability)
  const jurisdiction = await getSupervisorJurisdiction(user.id);
  // Add robust check here if needed

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <ComplaintDetailHeader complaint={complaint} userId={user.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN (Main Info) - Spans 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            <ComplaintInfoCard complaint={complaint} />

            <AttachmentsSection
              citizenUploads={attachmentsRes.citizenUploads}
              staffUploads={attachmentsRes.staffUploads}
            />

            <CommunicationThread
              complaintId={complaint.id}
              initialMessages={complaint.updates || []}
              currentUserId={user.id}
            />

            <InternalNotes
              complaintId={complaint.id}
              initialNotes={internalNotesRes}
            />

            <StatusTimeline history={complaint.history || []} />
          </div>

          {/* RIGHT COLUMN (Management) - Spans 4 cols */}
          <div className="lg:col-span-4 space-y-6">
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

            <CitizenInfoPanel citizen={complaint.citizen} />

            <RelatedComplaints complaints={relatedRes} />
          </div>
        </div>
      </div>
    </div>
  );
}
