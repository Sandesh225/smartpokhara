// ═══════════════════════════════════════════════════════════
// COMPLAINT DETAIL PAGE - Main Layout (Server Component)
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
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-6 lg:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <header className="mb-4 md:mb-6 lg:mb-8">
        <ComplaintDetailHeader complaint={complaint} userId={user.id} />
      </header>

      {/* RESPONSIVE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* LEFT COLUMN - Main Content (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Main Info Card */}
          <section className="stone-card overflow-hidden">
            <ComplaintInfoCard complaint={complaint} />
          </section>

          {/* Communication Thread */}
          <section className="stone-card overflow-hidden">
            <CommunicationThread
              complaintId={complaint.id}
              initialMessages={messages}
              currentUserId={user.id}
            />
          </section>

          {/* Internal Notes */}
          <section className="stone-card overflow-hidden">
            <InternalNotes complaintId={complaint.id} initialNotes={notes} />
          </section>

          {/* Status Timeline */}
          <section className="stone-card p-4 md:p-6">
            <h3 className="text-sm md:text-base font-bold mb-4 flex items-center gap-2 text-primary">
              <Info className="w-4 h-4 md:w-5 md:h-5" />
              Resolution Timeline
            </h3>
            <StatusTimeline history={complaint.timeline || []} />
          </section>
        </div>

        {/* RIGHT COLUMN - Sidebar (4 cols on desktop) */}
        <aside className="lg:col-span-4 space-y-4 md:space-y-6 lg:sticky lg:top-6">
          {/* SLA Tracker */}
          <div className="stone-card overflow-hidden elevation-2">
            <SLATracker
              deadline={complaint.sla_due_at}
              status={complaint.status}
              createdAt={complaint.submitted_at}
            />
          </div>

          {/* Citizen Information Panel */}
          <div className="relative">
            {/* Identity Badge */}
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

          {/* System Metadata */}
          <div className="glass rounded-xl md:rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-3 md:px-4 py-2.5 md:py-3 bg-muted/30 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                  Metadata
                </h3>
              </div>
              <span className="text-[8px] md:text-[9px] font-mono px-2 py-0.5 bg-background/50 border border-border rounded-full text-muted-foreground">
                V3.0
              </span>
            </div>

            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
              <div>
                <label className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Reference ID
                </label>
                <code className="block p-2 md:p-2.5 bg-muted rounded-lg font-mono text-[10px] md:text-xs text-foreground break-all border border-border">
                  {complaint.id}
                </code>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase">
                  Table
                </span>
                <span className="text-[10px] md:text-xs font-mono text-primary">
                  public.complaints
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
