// ==================== DEPARTMENT DETAIL PAGE ====================
// app/admin/departments/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Edit, Mail, Phone, Users, MapPin } from "lucide-react";
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

  const { data: department } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .single();

  if (!department) notFound();

  // Fixed staff query - get ALL staff for this department
  const { data: staffData, error: staffError } = await supabase
    .from("staff_profiles")
    .select("user_id, staff_role")
    .eq("department_id", id);

  console.log("Staff query result:", {
    staffData,
    staffError,
    departmentId: id,
  });

  // Get user profiles separately for better control
  let formattedStaff: any[] = [];

  if (staffData && staffData.length > 0) {
    const userIds = staffData.map((s) => s.user_id);

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    console.log("Profiles fetched:", profiles);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p.full_name])
    );

    formattedStaff = staffData.map((s: any) => {
      const fullName = profileMap.get(s.user_id) || "Unknown User";
      return {
        user_id: s.user_id,
        name: fullName,
        role: s.staff_role || "staff",
        initials: fullName.substring(0, 2).toUpperCase(),
      };
    });
  }

  console.log("Formatted staff:", formattedStaff);

  const { data: categories } = await supabase
    .from("complaint_categories")
    .select("id, name")
    .eq("default_department_id", id);

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

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const { data: workloadData } = await supabase
    .from("staff_work_assignments")
    .select("created_at")
    .in(
      "staff_id",
      formattedStaff.map((s) => s.user_id)
    )
    .gte("created_at", fiveDaysAgo.toISOString())
    .order("created_at");

  const workloadMap = new Map<string, number>();
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    workloadMap.set(dayName, 0);
  }

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
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/departments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Departments
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl elevation-3 font-mono">
                {department.code}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">
                  {department.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {department.name_nepali}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {department.contact_email && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-foreground">
                      <Mail className="w-4 h-4 text-primary" />
                      {department.contact_email}
                    </span>
                  )}
                  {department.contact_phone && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-foreground">
                      <Phone className="w-4 h-4 text-primary" />
                      {department.contact_phone}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold">
                    <Users className="w-4 h-4" />
                    {formattedStaff.length} Staff Members
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/admin/departments/${id}/edit`}
              className="inline-flex items-center gap-2.5 px-5 py-3 glass border border-border rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-all group elevation-1 hover:elevation-2"
            >
              <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Edit Department
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DepartmentPerformance
              total={total || 0}
              resolved={resolved || 0}
              open={open || 0}
              overdue={overdue || 0}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DepartmentWorkload data={formattedWorkload} />
              <CategoryMapping categories={categories || []} />
            </div>

            <div className="glass rounded-2xl p-6 border border-border elevation-1">
              <h4 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Department Overview
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {department.description ||
                  "No description provided for this department."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <DepartmentStaffList staff={formattedStaff} />
          </div>
        </div>
      </div>
    </div>
  );
}
