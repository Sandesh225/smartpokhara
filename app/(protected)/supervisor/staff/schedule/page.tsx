import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { ScheduleCalendar } from "@/components/supervisor/staff/ScheduleCalendar";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Team Schedule</h1>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Manage Shifts
        </button>
      </div>

      <ScheduleCalendar />
    </div>
  );
}