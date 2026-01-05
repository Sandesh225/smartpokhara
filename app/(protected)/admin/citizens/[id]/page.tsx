import { createClient } from "@/lib/supabase/server";
import { citizenQueries } from "@/lib/supabase/queries/admin/citizens";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CitizenWalletView from "../_components/CitizenWalletView";
import CitizenProfile from "./../_components/CitizenProfile";
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/citizens"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Citizen Profile</h1>
      </div>

      <CitizenWalletView bills={payments} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <CitizenProfile profile={profile} />
          <AccountActions
            userId={profile.user_id}
            isActive={profile.is_active}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ComplaintHistory complaints={complaints} />
          <CitizenPaymentHistory payments={payments} />
        </div>
      </div>
    </div>
  );
}
