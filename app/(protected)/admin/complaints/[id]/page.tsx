import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminComplaintQueries } from "@/lib/supabase/queries/admin/complaints";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";

// Reuse Supervisor components for efficiency where UI is identical
import { ComplaintDetailHeader } from "@/app/(protected)/supervisor/complaints/_components/complaints/ComplaintDetailHeader";
import { ComplaintInfoCard } from "@/app/(protected)/supervisor/complaints/_components/ComplaintInfoCard";
import { StatusTimeline } from "@/app/(protected)/supervisor/complaints/_components/complaints/StatusTimeline";
import { CitizenInfoPanel } from "@/app/(protected)/supervisor/complaints/_components/CitizenInfoPanel";
import { InternalNotes } from "@/app/(protected)/supervisor/complaints/_components/InternalNotes";
import { AttachmentsSection } from "@/app/(protected)/supervisor/complaints/_components/AttachmentsSection";
import { SLATracker } from "@/app/(protected)/supervisor/complaints/_components/SLATracker";
import { CommunicationThread } from "@/app/(protected)/supervisor/complaints/_components/CommunicationThread";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminComplaintDetail({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  const complaint = await adminComplaintQueries.getComplaintById(supabase, id);
  if (!complaint) return notFound();

  // Fetch related data in parallel if needed (mocked here or use supervisor queries for consistency)
  const timeline = complaint.timeline || [];
  const attachments = { citizenUploads: [], staffUploads: [] }; // Populate properly if data exists

  return (
    <div className="space-y-6">
      <ComplaintDetailHeader complaint={complaint} userId={user.id} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <ComplaintInfoCard complaint={complaint} />

          {/* Admin specific: Full Communication Access */}
          <CommunicationThread
            complaintId={complaint.id}
            initialMessages={[]} // Populate with actual messages
            currentUserId={user.id}
          />

          <InternalNotes
            complaintId={complaint.id}
            initialNotes={[]} // Populate
          />

          <StatusTimeline history={timeline} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <SLATracker
            deadline={complaint.sla_due_at}
            status={complaint.status}
            createdAt={complaint.submitted_at}
          />

          {/* Admin can see citizen details even if anonymous (usually) or adheres to strict rules */}
          <CitizenInfoPanel
            citizen={complaint.citizen}
            isAnonymous={complaint.is_anonymous}
          />

          {/* Admin specific: Audit Log Link */}
          <div className="p-4 bg-gray-50 border rounded-xl text-center">
            <p className="text-sm text-gray-500 mb-2">System Record</p>
            <div className="text-xs font-mono text-gray-400 break-all">
              {complaint.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
