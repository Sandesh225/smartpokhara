// ==================== DEPARTMENTS LIST PAGE ====================
// app/admin/departments/page.tsx

import Link from "next/link";
import { Plus, Building2, Users, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DepartmentTable from "./_components/DepartmentsTable";

export default async function DepartmentsPage() {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  if (error) {
    console.error("DB Error:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <p className="text-destructive font-semibold mb-2">Error Loading Departments</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const headIds = departments
    .map((d) => d.head_user_id)
    .filter((id) => id !== null) as string[];

  let profileMap = new Map<string, string>();

  if (headIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, full_name")
      .in("user_id", headIds);

    if (profiles) {
      profileMap = new Map(profiles.map((p) => [p.user_id, p.full_name]));
    }
  }

  const { data: staffData } = await supabase
    .from("staff_profiles")
    .select("department_id");

  const staffCounts = (staffData || []).reduce((acc: any, curr) => {
    if (curr.department_id) {
      acc[curr.department_id] = (acc[curr.department_id] || 0) + 1;
    }
    return acc;
  }, {});

  const formattedData = departments.map((dept) => ({
    ...dept,
    head_name: dept.head_user_id
      ? profileMap.get(dept.head_user_id) || "Unknown"
      : null,
    staff_count: staffCounts[dept.id] || 0,
  }));

  const totalDepts = formattedData.length;
  const activeDepts = formattedData.filter(d => d.is_active).length;
  const totalStaff = formattedData.reduce((sum, d) => sum + d.staff_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary tracking-tight mb-3">
                Department Management
              </h1>
              <p className="text-muted-foreground text-lg">
                Oversee municipal divisions, staff allocation, and operational efficiency
              </p>
            </div>

            <Link
              href="/admin/departments/create"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg elevation-2 hover:elevation-3 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              New Department
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass rounded-2xl p-6 border border-border elevation-1 hover:elevation-2 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground tabular-nums">{totalDepts}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Total Departments</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${totalDepts > 0 ? (activeDepts / totalDepts) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-primary tabular-nums">{activeDepts} Active</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-border elevation-1 hover:elevation-2 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground tabular-nums">{totalStaff}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Total Staff Members</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Avg. <span className="font-semibold text-foreground tabular-nums">{totalDepts > 0 ? (totalStaff / totalDepts).toFixed(1) : 0}</span> per department
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-border elevation-1 hover:elevation-2 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Activity className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground tabular-nums">
                    {((activeDepts / totalDepts) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Operational Rate</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                System-wide efficiency metric
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="space-y-4">
          <DepartmentTable data={formattedData} />
        </div>
      </div>
    </div>
  );
}
