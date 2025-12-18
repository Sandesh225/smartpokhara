import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { staffPerformanceQueries } from "@/lib/supabase/queries/staff-performance";
import { PerformanceOverview } from "@/components/staff/performance/PerformanceOverview";
import { AchievementsList } from "@/components/staff/performance/AchievementsList";
import { BarChart2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const staff = await getCurrentUserWithRoles();
  if (!staff) redirect("/login");

  const supabase = await createClient();

  const [metrics, achievements] = await Promise.all([
    staffPerformanceQueries.getMyPerformance(supabase, staff.user_id),
    staffPerformanceQueries.getAchievements(supabase, staff.user_id)
  ]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
          <p className="text-sm text-gray-500">Your impact over the last 30 days.</p>
        </div>
      </div>

      <PerformanceOverview metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <AchievementsList achievements={achievements} />
         
         {/* Placeholder for Charts or Recent Work */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[200px] flex items-center justify-center text-gray-400 text-sm italic">
            Performance charts coming soon...
         </div>
      </div>
    </div>
  );
}