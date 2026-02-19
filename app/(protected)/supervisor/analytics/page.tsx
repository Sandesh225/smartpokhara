// app/(protected)/supervisor/analytics/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";
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

  // Parallel data fetching
  const [metrics, trendData, categoryData, heatmapData, staffData] =
    await Promise.all([
      supervisorApi.getAggregatedMetrics(supabase),
      supervisorApi.getTrendData(supabase, user.id),
      // FIX: Removed 'user.id' because getCategoryBreakdown only expects (client)
      supervisorApi.getCategoryBreakdown(supabase), 
      supervisorApi.getWardHeatmapData(supabase),
      supervisorApi.getStaffMetrics(supabase, user.id),
    ]);

  // Ensure trendData is mapped correctly if the API returns 'total' instead of 'count'
  const formattedTrendData = (trendData || []).map(item => ({
    date: item.date,
    count: (item as any).count ?? (item as any).total ?? 0,
    resolved: item.resolved ?? 0
  }));

  const staffComparisonData = (staffData || []).map((s: any) => ({
    name: (s.name || "Unknown").split(" ")[0],
    totalResolved: s.totalResolved || 0,
    slaCompliance: s.slaCompliance || 0,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            Export Report
          </button>
        </div>
      </div>

      <AnalyticsOverview metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Passing the safe, formatted trend data */}
          <ComplaintsTrendChart data={formattedTrendData} />
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
          <div className="h-[300px]">
            <HeatmapChart data={heatmapData} />
          </div>
        </div>
        <StaffPerformanceComparison data={staffComparisonData} />
      </div>
    </div>
  );
}