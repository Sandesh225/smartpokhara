// ═══════════════════════════════════════════════════════════
// app/admin/citizens/[id]/page.tsx - CITIZEN DETAIL PAGE
// ═══════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/server";
import { citizenQueries } from "@/lib/supabase/queries/admin/citizens";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CitizenWalletView from "../_components/CitizenWalletView";
import CitizenProfileCard from "../_components/CitizenProfile";
import AccountActions from "../_components/AccountActions";
import ComplaintHistory from "../_components/CitizenComplaintHistory";
import CitizenPaymentHistory from "../_components/CitizenPaymentHistory";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function CitizenDetailPage({
  params,
}: {
  params: Params;
}) {
  const supabase = await createClient();
  const { id: userId } = await params;

  const [profile, complaints, payments] = await Promise.all([
    citizenQueries.getCitizenDetails(supabase, userId),
    citizenQueries.getCitizenComplaints(supabase, userId),
    citizenQueries.getCitizenPayments(supabase, userId),
  ]);

  if (!profile) return notFound();

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href="/admin/citizens">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
          Citizen Profile
        </h1>
      </div>

      {/* WALLET VIEW */}
      <CitizenWalletView bills={payments} />

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT COLUMN - Profile & Actions */}
        <div className="space-y-4 md:space-y-6 lg:order-1">
          <CitizenProfileCard profile={profile} />
          <AccountActions
            userId={profile.user_id}
            isActive={profile.is_active}
          />
        </div>

        {/* RIGHT COLUMN - History */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:order-2">
          <ComplaintHistory complaints={complaints} />
          <CitizenPaymentHistory payments={payments} />
        </div>
      </div>
    </div>
  );
}
