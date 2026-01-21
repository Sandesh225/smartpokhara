// ==================== CREATE DEPARTMENT PAGE ====================
// app/admin/departments/create/page.tsx

import { createClient } from "@/lib/supabase/server";
import DepartmentForm from "../_components/DepartmentForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function CreateDepartmentPage() {
  const supabase = await createClient();

  const { data: potentialManagers } = await supabase
    .from("user_profiles")
    .select("user_id, full_name")
    .order("full_name");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/admin/departments"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Departments
        </Link>

        <DepartmentForm potentialManagers={potentialManagers || []} />
      </div>
    </div>
  );
}
