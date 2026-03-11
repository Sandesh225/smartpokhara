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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-muted/50 rounded-xl border border-dashed border-border">
        <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
        <h3 className="text-lg font-semibold text-foreground">
          Unable to load data
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
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
        <Card className="stone-card border-none hover:elevation-3 transition-all">
          <CardHeader className="bg-warning-amber/10 pb-4 border-b border-warning-amber/20">
            <CardTitle className="flex items-center gap-2 text-warning-amber text-lg">
              <Trophy className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {topPerformers.map((staff, index) => (
              <div
                key={staff.user_id}
                className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border shadow-sm hover:border-warning-amber/40 transition-colors"
              >
                <div className="font-black text-xl text-warning-amber/50 w-6 text-center">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10 border border-warning-amber/20">
                  <AvatarFallback className="bg-warning-amber/10 text-warning-amber font-bold">
                    {staff.full_name?.[0]?.toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {staff.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate capitalize">
                    {staff.department ||
                      (staff.ward_number
                        ? `Ward ${staff.ward_number}`
                        : staff.staff_role.replace("_", " "))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-foreground">
                    {staff.resolved_complaints}
                  </div>
                  <div className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                    Resolved
                  </div>
                </div>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm font-bold">
                No performance data recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ⚠️ Needs Attention */}
        <Card className="stone-card border-none hover:elevation-3 transition-all">
          <CardHeader className="bg-destructive/10 pb-4 border-b border-destructive/20">
            <CardTitle className="flex items-center gap-2 text-destructive text-lg">
              <AlertTriangle className="w-5 h-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {laggards.map((staff) => (
              <div
                key={staff.user_id}
                className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border shadow-sm hover:border-destructive/40 transition-colors"
              >
                <Avatar className="h-10 w-10 border border-destructive/20">
                  <AvatarFallback className="bg-destructive/10 text-destructive font-bold">
                    {staff.full_name?.[0]?.toUpperCase() || "!"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {staff.full_name}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="h-5 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 font-bold"
                    >
                      {staff.active_complaints} Active
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-5 text-xs bg-warning-amber/10 text-warning-amber hover:bg-warning-amber/20 border-warning-amber/20 font-bold"
                    >
                      ★ {staff.avg_rating}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-primary hover:text-primary/80"
                >
                  View
                </Button>
              </div>
            ))}
            {laggards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm font-bold">
                All staff are performing within expected parameters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card className="stone-card">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="text-lg text-foreground font-bold tracking-tight">
            Full Staff Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground font-black uppercase text-xs tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Role / Unit</th>
                  <th className="px-6 py-4 text-center">Assigned</th>
                  <th className="px-6 py-4 text-center">Resolved</th>
                  <th className="px-6 py-4 text-center">Efficiency</th>
                  <th className="px-6 py-4 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-foreground">
                        {staff.full_name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground capitalize">
                        {staff.staff_role.replace("_", " ")}
                        <span className="block text-xs font-mono font-bold">
                          {staff.department ||
                            (staff.ward_number
                              ? `Ward ${staff.ward_number}`
                              : "")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground font-mono font-bold">
                        {staff.total_complaints}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-success-green text-lg">
                        {staff.resolved_complaints}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden border border-border">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                efficiency >= 80
                                  ? "bg-success-green"
                                  : efficiency >= 50
                                  ? "bg-warning-amber"
                                  : "bg-destructive"
                              }`}
                              style={{ width: `${efficiency}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">
                            {efficiency}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-primary">
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