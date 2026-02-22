import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, AlertTriangle, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Define the exact shape of our new View
interface StaffPerformance {
  user_id: string;
  full_name: string;
  staff_role: string;
  department: string | null;
  ward_number: number | null;
  total_complaints: number;
  resolved_complaints: number;
  active_complaints: number;
  on_time_resolutions: number;
  avg_rating: number;
}

export default async function PerformancePage() {
  const supabase = await createClient();

  // Fetch performance data
  const { data, error } = await supabase
    .from("mv_staff_performance")
    .select("*")
    .order("resolved_complaints", { ascending: false });

  if (error) {
    console.error("Error fetching staff performance:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-gray-50 rounded-xl border border-dashed">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">
          Unable to load data
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          The performance analytics view might be missing or permission is
          denied. Please contact the administrator to run the database
          migration.
        </p>
      </div>
    );
  }

  const staffPerformance = data as StaffPerformance[];

  // Logic: Top 5 by resolved count
  const topPerformers = staffPerformance.slice(0, 5);

  // Logic: Needs Attention (Active > 0, Sorted by Rating Ascending)
  const laggards = [...staffPerformance]
    .filter((s) => s.active_complaints > 0)
    .sort((a, b) => a.avg_rating - b.avg_rating)
    .slice(0, 5);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Staff Performance
          </h1>
          <p className="text-gray-500">
            Real-time analytics and efficiency metrics.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🏆 Top Performers */}
        <Card className="border-t-4 border-t-yellow-400 shadow-sm">
          <CardHeader className="bg-yellow-50/50 pb-4 border-b border-yellow-100">
            <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {topPerformers.map((staff, index) => (
              <div
                key={staff.user_id}
                className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="font-black text-xl text-yellow-400/50 w-6 text-center">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10 border border-yellow-200">
                  <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold">
                    {staff.full_name?.[0]?.toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {staff.full_name}
                  </div>
                  <div className="text-xs text-gray-500 truncate capitalize">
                    {staff.department ||
                      (staff.ward_number
                        ? `Ward ${staff.ward_number}`
                        : staff.staff_role.replace("_", " "))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {staff.resolved_complaints}
                  </div>
                  <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                    Resolved
                  </div>
                </div>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No performance data recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ⚠️ Needs Attention */}
        <Card className="border-t-4 border-t-red-400 shadow-sm">
          <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
            <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {laggards.map((staff) => (
              <div
                key={staff.user_id}
                className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
              >
                <Avatar className="h-10 w-10 border border-red-100">
                  <AvatarFallback className="bg-red-50 text-red-600 font-bold">
                    {staff.full_name?.[0]?.toUpperCase() || "!"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {staff.full_name}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="h-5 text-xs bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    >
                      {staff.active_complaints} Active
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-5 text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200"
                    >
                      ★ {staff.avg_rating}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  View
                </Button>
              </div>
            ))}
            {laggards.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                All staff are performing within expected parameters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg text-gray-900">
            Full Staff Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Role / Unit</th>
                  <th className="px-6 py-4 text-center">Assigned</th>
                  <th className="px-6 py-4 text-center">Resolved</th>
                  <th className="px-6 py-4 text-center">Efficiency</th>
                  <th className="px-6 py-4 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffPerformance.map((staff) => {
                  const efficiency =
                    staff.resolved_complaints > 0
                      ? Math.round(
                          (staff.on_time_resolutions /
                            staff.resolved_complaints) *
                            100
                        )
                      : 0;

                  return (
                    <tr
                      key={staff.user_id}
                      className="group hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {staff.full_name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 capitalize">
                        {staff.staff_role.replace("_", " ")}
                        <span className="block text-xs text-gray-400">
                          {staff.department ||
                            (staff.ward_number
                              ? `Ward ${staff.ward_number}`
                              : "")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {staff.total_complaints}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-green-600">
                        {staff.resolved_complaints}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                efficiency >= 80
                                  ? "bg-green-500"
                                  : efficiency >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${efficiency}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {efficiency}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-medium">
                        {staff.avg_rating > 0 ? staff.avg_rating : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}