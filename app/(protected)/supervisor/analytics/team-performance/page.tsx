import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorApi } from "@/features/supervisor";
import { PerformanceLeaderboard } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/PerformanceLeaderboard";
import { StaffPerformanceComparison } from "@/app/(protected)/supervisor/analytics/jurisdiction/_components/StaffPerformanceComparison";

export const dynamic = "force-dynamic";

export default async function TeamPerformancePage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const staffData = await supervisorApi.getStaffMetrics(supabase, user.id);

  // Prepare Rankings
  const rankedBySLA = [...staffData].sort((a, b) => b.slaCompliance - a.slaCompliance).map((s, i) => ({ ...s, score: s.slaCompliance, rank: i + 1 }));
  const rankedByRating = [...staffData].sort((a, b) => b.rating - a.rating).map((s, i) => ({ ...s, score: Number(s.rating.toFixed(1)), rank: i + 1 }));

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceLeaderboard data={rankedBySLA} metricLabel="SLA Compliance %" />
        <PerformanceLeaderboard data={rankedByRating} metricLabel="Avg Rating" />
      </div>
      
      <StaffPerformanceComparison 
        data={staffData.map(s => ({ 
            name: s.name, 
            totalResolved: s.totalResolved, 
            slaCompliance: s.slaCompliance 
        }))} 
      />
    </div>
  );
}