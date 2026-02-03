// ═══════════════════════════════════════════════════════════
// ADMIN COMPLAINT DETAIL PAGE (Server Component)
// FIXED: Updated for Next.js 15 & Safe Query Handling
// ═══════════════════════════════════════════════════════════

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
  // 1. Resolve Params (Next.js 15+)
  const { id } = await params;

  // 2. Auth Check
  const user = await getCurrentUserWithRoles();
  if (!user || !isAdmin(user)) redirect("/login");

  // 3. Initialize Supabase
  const supabase = await createClient();

  // 4. Fetch Data
  const complaint = await adminComplaintQueries.getComplaintById(supabase, id);

  if (!complaint) return notFound();

  // 5. Initialize Sub-data (Placeholders until API exists)
  const messages: any[] = []; 
  const notes: any[] = [];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-6 lg:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <header className="mb-4 md:mb-6 lg:mb-8">
        <ComplaintDetailHeader complaint={complaint} userId={user.id} />
      </header>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* LEFT MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          
          {/* Main Info */}
          <section className="stone-card overflow-hidden">
            <ComplaintInfoCard complaint={complaint} />
          </section>

          {/* Messages */}
          <section className="stone-card overflow-hidden">
            <CommunicationThread
              complaintId={complaint.id}
              initialMessages={messages}
              currentUserId={user.id}
            />
          </section>

          {/* Internal Notes */}
          <section className="stone-card overflow-hidden">
            <InternalNotes
              complaintId={complaint.id}
              initialNotes={notes}
            />
          </section>

          {/* Timeline */}
          <section className="stone-card p-4 md:p-6">
            <h3 className="text-sm md:text-base font-bold mb-4 flex items-center gap-2 text-primary">
              <Info className="w-4 h-4 md:w-5 md:h-5" />
              Resolution Timeline
            </h3>
            <StatusTimeline history={complaint.timeline || []} />
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-4 space-y-4 md:space-y-6 lg:sticky lg:top-6">
          
          {/* SLA Tracker */}
          <div className="stone-card overflow-hidden elevation-2">
            <SLATracker
              deadline={complaint.sla_due_at}
              status={complaint.status}
              createdAt={complaint.submitted_at}
            />
          </div>

          {/* Citizen Info & Badges */}
          <div className="relative">
            <div className="absolute -top-2 -right-2 z-10">
              {complaint.is_anonymous ? (
                <div className="bg-warning-amber text-white p-2 rounded-xl shadow-lg border-2 border-background">
                  <Fingerprint className="w-4 h-4" />
                </div>
              ) : (
                <div className="bg-success-green text-white p-2 rounded-xl shadow-lg border-2 border-background">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="stone-card p-4 md:p-6">
              <CitizenInfoPanel
                citizen={complaint.citizen}
                isAnonymous={complaint.is_anonymous}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="glass rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">
                Metadata
              </span>
            </div>

            <div className="p-4 space-y-3">
              <code className="block p-2 bg-muted rounded-lg text-xs break-all">
                {complaint.id}
              </code>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}