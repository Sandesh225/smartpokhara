import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { complaintsApi } from "@/features/complaints";

// Machhapuchhre Modern Shared Components
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

  // 1. Parallel Handshake: Fetching Core Ledger Data
  const [complaintResult, notesResult, attachmentsResult] = await Promise.all([
    complaintsApi.getComplaintById(supabase, id),
    complaintsApi.getInternalNotes(supabase, id).catch(() => []),
    complaintsApi
      .getComplaintAttachments(supabase, id)
      .catch(() => ({ citizenUploads: [], staffUploads: [] })),
  ]);

  const complaint = complaintResult;

  if (!complaint) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-12 transition-colors duration-300">
      <ComplaintDetailHeader complaint={complaint} userId={user.id} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Jurisdiction Breadcrumb / System ID */}
        <div className="mb-6 flex items-center gap-2">
            <div className="h-4 w-1 bg-primary rounded-full shrink-0" />
            <span className="text-sm font-semibold text-muted-foreground tracking-tight">
                Record ID: {complaint.tracking_code} • Ward {complaint.ward.ward_number}
            </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Operations & Evidence (The "Story") */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Evidence Grid */}
            <div className="bg-card border border-border rounded-xl shadow-xs p-1">
                <AttachmentsSection
                citizenUploads={attachmentsResult.citizenUploads}
                staffUploads={attachmentsResult.staffUploads}
                />
            </div>

            {/* Tactical Communication Flow */}
            <CommunicationThread
              complaintId={complaint.id}
              initialMessages={complaint.updates || []}
              currentUserId={user.id}
            />

            {/* Secretariat Internal Ledger (Notes) */}
            <InternalNotes
              complaintId={complaint.id}
              initialNotes={notesResult}
              currentUserId={user.id}
            />

            {/* Audit Trail */}
            <StatusTimeline history={complaint.history || []} />
          </div>

          {/* RIGHT COLUMN: Command & Control (Metadata) */}
          <aside className="xl:col-span-4 space-y-6 sticky top-24">
            
            <SLATracker
              deadline={complaint.sla_due_at}
              status={complaint.status}
              createdAt={complaint.submitted_at}
            />

            {/* Command Assignment */}
            <div className="bg-card border border-border rounded-xl shadow-xs p-1 md:p-6 mb-6">
                <AssignmentPanel
                complaint={complaint}
                currentSupervisorId={user.id}
                />
            </div>

            {/* Urgency Protocol */}
            <PriorityPanel
              complaintId={complaint.id}
              currentPriority={complaint.priority}
            />

            {/* Citizen Identity Module */}
            <CitizenInfoPanel
              citizen={complaint.citizen}
              isAnonymous={complaint.is_anonymous}
            />

            {/* Protocol Note */}
            <div className="px-5 py-4 rounded-xl border border-border bg-muted/30 mt-6 shadow-xs">
                <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                   <strong className="text-foreground">Audit Notice:</strong> All state changes to this record are immutable and securely logged.
                </p>
            </div>
          </aside>
          
        </div>
      </main>
    </div>
  );
}