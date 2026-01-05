import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Edit, Mail, Phone, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DepartmentPerformance from "../_components/DepartmentPerformance";
import DepartmentStaffList from "../_components/DepartmentStaffList";
import CategoryMapping from "../_components/CategoryMapping";
import DepartmentWorkload from "../_components/DepartmentWorkload";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // --- 1. Fetch Department Info ---
  const { data: department } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .single();

  if (!department) notFound();

  // --- 2. Fetch Staff Members ---
  const { data: staffData } = await supabase
    .from("staff_profiles")
    .select(
      `
      user_id,
      staff_role,
      user_profiles!user_id (full_name)
    `
    )
    .eq("department_id", id);

  const formattedStaff = (staffData || []).map((s: any) => ({
    user_id: s.user_id,
    name: s.user_profiles?.full_name || "Unknown",
    role: s.staff_role,
    initials: s.user_profiles?.full_name?.substring(0, 2).toUpperCase() || "ST",
  }));

  // --- 3. Fetch Mapped Categories ---
  // Assuming 'complaint_categories' has a 'default_department_id' field
  const { data: categories } = await supabase
    .from("complaint_categories")
    .select("id, name")
    .eq("default_department_id", id);

  // --- 4. Fetch Performance Metrics ---
  const { count: total } = await supabase
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("assigned_department_id", id);

  const { count: resolved } = await supabase
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("assigned_department_id", id)
    .in("status", ["resolved", "closed"]);

  const { count: open } = await supabase
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("assigned_department_id", id)
    .in("status", ["assigned", "in_progress", "received"]);

  const { count: overdue } = await supabase
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("assigned_department_id", id)
    .lt("sla_due_at", new Date().toISOString())
    .not("status", "in", '("resolved","closed")');

  // --- 5. Fetch Workload Data (Last 5 Days) ---
  // We fetch assignments created in the last 5 days for staff in this dept
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const { data: workloadData } = await supabase
    .from("staff_work_assignments")
    .select("created_at")
    .in(
      "staff_id",
      formattedStaff.map((s) => s.user_id)
    ) // Only assignments for this dept's staff
    .gte("created_at", fiveDaysAgo.toISOString())
    .order("created_at");

  // Aggregating workload by day in JS (simple approach)
  const workloadMap = new Map<string, number>();
  // Initialize last 5 days with 0
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    workloadMap.set(dayName, 0);
  }

  // Fill real counts
  workloadData?.forEach((w) => {
    const dayName = new Date(w.created_at).toLocaleDateString("en-US", {
      weekday: "short",
    });
    if (workloadMap.has(dayName)) {
      workloadMap.set(dayName, (workloadMap.get(dayName) || 0) + 1);
    }
  });

  const formattedWorkload = Array.from(workloadMap).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="mb-8">
        <Link
          href="/admin/departments"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20 font-mono">
              {department.code}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {department.name}
              </h1>
              <p className="text-muted-foreground">{department.name_nepali}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />{" "}
                  {department.contact_email || "No Email"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />{" "}
                  {department.contact_phone || "No Phone"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {formattedStaff.length} Staff
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/admin/departments/${id}/edit`}
            className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:bg-neutral-stone-50 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit Details
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <DepartmentPerformance
            total={total || 0}
            resolved={resolved || 0}
            open={open || 0}
            overdue={overdue || 0}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real Workload Chart */}
            <div className="h-64">
              <DepartmentWorkload data={formattedWorkload} />
            </div>
            {/* Real Categories List */}
            <div className="h-full min-h-[16rem]">
              <CategoryMapping categories={categories || []} />
            </div>
          </div>

          <div className="stone-card p-6">
            <h4 className="font-bold text-foreground mb-2">Description</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {department.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <DepartmentStaffList staff={formattedStaff} />
        </div>
      </div>
    </div>
  );
}
