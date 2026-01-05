import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DepartmentTable from "./_components/DepartmentsTable";

export default async function DepartmentsPage() {
  // 1. FIX: Add 'await' here
  const supabase = await createClient();

  // 2. Fetch Departments
  const { data: departments, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  if (error) {
    console.error("DB Error:", error);
    return <div>Error loading departments.</div>;
  }

  // 3. Fetch User Profiles Manually (Fixes 'Vacant' issues)
  const headIds = departments
    .map((d) => d.head_user_id)
    .filter((id) => id !== null) as string[];

  // Only query if we have IDs to look up
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

  // 4. Fetch Staff Counts
  const { data: staffData } = await supabase
    .from("staff_profiles")
    .select("department_id");

  const staffCounts = (staffData || []).reduce((acc: any, curr) => {
    if (curr.department_id) {
      acc[curr.department_id] = (acc[curr.department_id] || 0) + 1;
    }
    return acc;
  }, {});

  // 5. Merge Data
  const formattedData = departments.map((dept) => ({
    ...dept,
    // Explicitly set the head object expected by the table
    head: {
      full_name: dept.head_user_id
        ? profileMap.get(dept.head_user_id) || "Unknown"
        : null,
    },
    staff_count: staffCounts[dept.id] || 0,
  }));

  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Departments
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage municipal divisions and resource allocation.
          </p>
        </div>

        <Link
          href="/admin/departments/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:brightness-110 transition-all shadow-md elevation-2"
        >
          <Plus className="w-5 h-5" /> New Department
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DepartmentTable data={formattedData} />
      </div>
    </div>
  );
}
