import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorAnalyticsQueries } from "@/lib/supabase/queries/supervisor-analytics";
import { AnalyticsOverview } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/AnalyticsOverview";
import { ComplaintsTrendChart } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/ComplaintsTrendChart";
import { CategoryDistribution } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/CategoryDistribution";
import { HeatmapChart } from "@/components/supervisor/charts/HeatmapChart";
import { StaffPerformanceComparison } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/StaffPerformanceComparison";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [metrics, trendData, categoryData, heatmapData, staffData] =
    await Promise.all([
      supervisorAnalyticsQueries.getAggregatedMetrics(supabase),
      supervisorAnalyticsQueries.getTrendData(supabase, user.id),
      supervisorAnalyticsQueries.getCategoryBreakdown(supabase),
      supervisorAnalyticsQueries.getWardHeatmapData(supabase),
      supervisorAnalyticsQueries.getStaffMetrics(supabase, user.id),
    ]);

  const staffComparisonData = staffData.map((s) => ({
    name: s.name.split(" ")[0],
    totalResolved: s.totalResolved,
    slaCompliance: s.slaCompliance,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      <AnalyticsOverview metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComplaintsTrendChart data={trendData} />
        </div>
        <div>
          <CategoryDistribution data={categoryData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-6">
            Ward Hotspots
          </h3>
          <HeatmapChart data={heatmapData} />
        </div>
        <StaffPerformanceComparison data={staffComparisonData} />
      </div>
    </div>
  );
}
