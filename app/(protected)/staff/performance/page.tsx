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
    <div className="space-y-6 p-6 max-w-7xl mx-auto pb-24">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-info-blue/10 text-info-blue rounded-xl border border-info-blue/20">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
            Performance Insights
          </h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Analytics for {user.email}</p>
        </div>
      </div>

      <PerformanceOverview metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementsList achievements={achievements} />
        <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex items-center justify-center border-dashed">
          <p className="text-muted-foreground/40 text-xs font-bold uppercase tracking-widest italic">
            Detailed metrics loading...
          </p>
        </div>
      </div>
    </div>
  );
}