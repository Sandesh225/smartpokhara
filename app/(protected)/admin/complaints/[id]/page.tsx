import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminComplaintQueries } from "@/lib/supabase/queries/admin/complaints";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";

// Components
import { ComplaintInfoCard } from "@/app/(protected)/supervisor/complaints/_components/ComplaintInfoCard";
import { CitizenInfoPanel } from "@/app/(protected)/supervisor/complaints/_components/CitizenInfoPanel";
import { InternalNotes } from "@/app/(protected)/supervisor/complaints/_components/InternalNotes";
import { SLATracker } from "@/app/(protected)/supervisor/complaints/_components/SLATracker";
import { CommunicationThread } from "@/app/(protected)/supervisor/complaints/_components/CommunicationThread";
import { ComplaintDetailHeader } from "@/app/(protected)/supervisor/complaints/_components/ComplaintDetailHeader";
import { StatusTimeline } from "@/app/(protected)/supervisor/complaints/_components/StatusTimeline";
import { ShieldCheck, Fingerprint, Database } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminComplaintDetail({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  // Fetch all required data in parallel to reduce waterfall latency
  const [complaint, messages, notes] = await Promise.all([
    adminComplaintQueries.getComplaintById(supabase, id),
    adminComplaintQueries.getMessages?.(supabase, id) || [],
    adminComplaintQueries.getInternalNotes?.(supabase, id) || []
  ]);

  if (!complaint) return notFound();

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* High-Action Header */}
      <ComplaintDetailHeader complaint={complaint} userId={user.id} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The Work Stream (8/12) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Main Issue Card */}
          <ComplaintInfoCard complaint={complaint} />

          {/* Tabbed or Stacked Content */}
          <div className="grid grid-cols-1 gap-6">
            <CommunicationThread
              complaintId={complaint.id}
              initialMessages={messages}
              currentUserId={user.id}
            />

            <InternalNotes
              complaintId={complaint.id}
              initialNotes={notes}
            />

            <StatusTimeline history={complaint.timeline || []} />
          </div>
        </div>

        {/* RIGHT COLUMN: Metadata & Security (4/12) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Priority & Deadline Section */}
          <SLATracker
            deadline={complaint.sla_due_at}
            status={complaint.status}
            createdAt={complaint.submitted_at}
          />

          {/* Citizen Dossier */}
          <div className="relative group">
            <div className="absolute -top-2 -right-2 z-10">
              {complaint.is_anonymous ? (
                <div className="bg-amber-500 text-white p-1.5 rounded-lg shadow-lg" title="Identity Redacted">
                  <Fingerprint className="w-4 h-4" />
                </div>
              ) : (
                <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg" title="Verified Identity">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>
            <CitizenInfoPanel
              citizen={complaint.citizen}
              isAnonymous={complaint.is_anonymous}
            />
          </div>

          {/* Admin System Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Metadata</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Internal Reference ID</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-600 break-all select-all cursor-copy hover:bg-slate-100 transition-colors">
                  {complaint.id}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500">DB Table</span>
                <span className="text-[10px] font-mono text-slate-400">public.complaints</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}