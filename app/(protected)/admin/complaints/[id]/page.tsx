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
import { ShieldCheck, Fingerprint, Database, Info } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminComplaintDetail({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserWithRoles();

  if (!user || !isAdmin(user)) redirect("/login");

  const supabase = await createClient();

  const [complaint, messages, notes] = await Promise.all([
    adminComplaintQueries.getComplaintById(supabase, id),
    adminComplaintQueries.getMessages?.(supabase, id) || [],
    adminComplaintQueries.getInternalNotes?.(supabase, id) || [],
  ]);

  if (!complaint) return notFound();

  return (
    /* Adjusted max-width to 1400px to reduce empty "floating" space on large monitors */
    <div className="max-w-[1400px] mx-auto w-full container-padding section-spacing animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 🏔️ Header - Now properly aligned with the grid below */}
      <header className="mb-8">
        <ComplaintDetailHeader complaint={complaint} userId={user.id} />
      </header>

      {/* GRID REFACTOR: 
          xl:grid-cols-12 -> 8/4 split. 
          Changed gap to 6 for a tighter, more professional "control center" feel.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: The Work Stream (Stone Foundation) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Content Area */}
          <section className="stone-card elevation-3 overflow-hidden bg-white">
            <div className="card-padding">
              <ComplaintInfoCard complaint={complaint} />
            </div>
          </section>

          <div className="space-y-6">
            <section className="stone-panel elevation-2 bg-white">
              <CommunicationThread
                complaintId={complaint.id}
                initialMessages={messages}
                currentUserId={user.id}
              />
            </section>

            <section className="stone-panel elevation-2 bg-white">
              <InternalNotes complaintId={complaint.id} initialNotes={notes} />
            </section>

            <div className="p-6 bg-neutral-stone-100/50 rounded-2xl border border-neutral-stone-200">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary-brand-dark">
                <Info className="w-4 h-4 text-primary-brand" />
                Resolution Timeline
              </h3>
              <StatusTimeline history={complaint.timeline || []} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Metadata & Security) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          {/* SLA Tracker */}
          <div className="elevation-4 rounded-[var(--radius)] overflow-hidden">
            <SLATracker
              deadline={complaint.sla_due_at}
              status={complaint.status}
              createdAt={complaint.submitted_at}
            />
          </div>

          {/* Citizen Dossier */}
          <div className="relative">
            <div className="absolute -top-2 -right-2 z-10">
              {complaint.is_anonymous ? (
                <div className="bg-[#E5793F] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <Fingerprint className="w-4 h-4" />
                </div>
              ) : (
                <div className="bg-success-green text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="stone-card card-padding border-primary-brand/5 shadow-sm">
              <CitizenInfoPanel
                citizen={complaint.citizen}
                isAnonymous={complaint.is_anonymous}
              />
            </div>
          </div>

          {/* System Metadata - Glass Aesthetic */}
          <div className="glass-strong rounded-2xl border border-white/40 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-white/30 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-primary-brand" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-brand-dark">
                  Metadata
                </h3>
              </div>
              <span className="text-[8px] font-mono px-2 py-0.5 bg-white/50 border border-white/50 rounded-full">
                V3.0
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-[9px] font-bold text-neutral-stone-500 uppercase tracking-tighter mb-1.5 block">
                  Reference ID
                </label>
                <code className="block p-2.5 bg-neutral-stone-200/50 rounded-lg font-mono text-[10px] text-text-ink break-all border border-neutral-stone-200/50">
                  {complaint.id}
                </code>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-[9px] font-bold text-neutral-stone-500 uppercase">
                  Table
                </span>
                <span className="text-[10px] font-mono text-primary-brand/70">
                  public.complaints
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}