import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { supervisorStaffQueries } from "@/lib/supabase/queries/supervisor-staff";
import { StaffPerformanceMetrics } from "@/app/(protected)/supervisor/staff/_components/StaffPerformanceMetrics";
import { PerformanceCharts } from "@/app/(protected)/supervisor/staff/_components/PerformanceCharts";
import { calculateResolutionTime, calculateSLACompliance } from "@/lib/utils/performance-helpers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ staffId: string }>;
}

export default async function StaffPerformancePage({ params }: PageProps) {
  const { staffId } = await params;
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const staffPerf = await supervisorStaffQueries.getStaffPerformance(supabase, staffId);
  const staffProfile = await supervisorStaffQueries.getStaffById(supabase, staffId);

  // Calculate Metrics
  const totalResolved = staffPerf.resolved.length;
  const avgTime = calculateResolutionTime(staffPerf.resolved);
  
  // Calculate SLA
  const onTimeCount = staffPerf.resolved.filter((r: any) => 
    new Date(r.resolved_at) <= new Date(r.sla_due_at)
  ).length;
  const slaCompliance = calculateSLACompliance(totalResolved, onTimeCount);
  
  // Mock Rating calc
  const rating = staffProfile?.performance_rating || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href={`/supervisor/staff/${staffId}`} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-sm text-gray-500">{staffProfile?.full_name}</p>
        </div>
      </div>

      <StaffPerformanceMetrics 
        metrics={{ totalResolved, avgTime, slaCompliance, rating }} 
      />

      <PerformanceCharts />
    </div>
  );
}