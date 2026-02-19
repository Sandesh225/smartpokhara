import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { staffApi } from "@/features/staff";

import { BarChart2 } from "lucide-react";
import { PerformanceOverview } from "./_components/PerformanceOverview";
import { AchievementsList } from "./_components/AchievementsList";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const user = await getCurrentUserWithRoles();
  // Ensure we are redirecting if no user exists
  if (!user) redirect("/login");

  // CRITICAL: Check if your user object uses .id or .user_id
  const staffId = user.id;

  const supabase = await createClient();

  const [metrics, achievements] = await Promise.all([
    staffApi.getMyPerformance(supabase, staffId),
    staffApi.getAchievements(supabase, staffId),
  ]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Performance Dashboard
          </h1>
          <p className="text-sm text-gray-500">Analytics for {user.email}</p>
        </div>
      </div>

      <PerformanceOverview metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementsList achievements={achievements} />
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
          <p className="text-gray-400 text-sm italic">
            Detailed metrics loading...
          </p>
        </div>
      </div>
    </div>
  );
}