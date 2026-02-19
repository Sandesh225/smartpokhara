import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";

import { CategoryDistribution } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/CategoryDistribution";
import { HeatmapChart } from "./_components/_charts/HeatmapChart";

export const dynamic = "force-dynamic";

export default async function JurisdictionPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [heatmapData, categoryData] = await Promise.all([
    supervisorApi.getWardHeatmapData(supabase),
    supervisorApi.getCategoryBreakdown(supabase),
  ]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Jurisdiction Analysis
      </h1>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Complaint Density Map
        </h3>
        <HeatmapChart data={heatmapData} height={400} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistribution data={categoryData} />
        {/* Placeholder for more granular ward stats if needed */}
      </div>
    </div>
  );
}
