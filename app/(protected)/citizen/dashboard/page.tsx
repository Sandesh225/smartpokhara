import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./_components/DashboardContent";

export default async function CitizenDashboard() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // STEP 1: Fetch Profile first (because notices depend on wardId)
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("full_name, ward_id, ward:wards(ward_number, name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) console.error("Profile fetch error:", profileError);

  const wardId = profile?.ward_id ?? null;
  const wardInfo = Array.isArray(profile?.ward) ? profile?.ward[0] : profile?.ward;

  // STEP 2: 100% Parallelized Fetching for everything else
  const noticesQuery = wardId
    ? supabase.from("notices").select("*").or(`is_public.eq.true,ward_id.eq.${wardId}`)
    : supabase.from("notices").select("*").eq("is_public", true);

  const [statsRes, complaintsRes, billsRes, noticesRes] = await Promise.all([
    supabase.rpc("rpc_get_dashboard_stats"),
    supabase.from("complaints").select("*").eq("citizen_id", user.id).order("submitted_at", { ascending: false }).limit(5),
    supabase.from("bills").select("*").eq("citizen_id", user.id).eq("status", "pending"),
    noticesQuery.order("published_at", { ascending: false }).limit(5),
  ]);

  const stats = statsRes.data?.complaints || {};

  return (
    <DashboardContent
      profile={{
        name: profile?.full_name?.split(" ")[0] || "Citizen",
        wardNumber: (wardInfo as any)?.ward_number ?? null,
        wardName: (wardInfo as any)?.name || "",
        wardId,
      }}
      complaints={complaintsRes.data || []}
      bills={billsRes.data || []}
      notices={noticesRes.data || []}
      stats={{
        total: stats.total || 0,
        open: stats.open || 0,
        inProgress: stats.in_progress || 0,
        resolved: stats.resolved || 0,
      }}
    />
  );
}