// ==================== EDIT DEPARTMENT PAGE ====================
// app/admin/departments/[id]/edit/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DepartmentForm from "../../_components/DepartmentForm";
import DeleteDepartmentAlert from "../../_components/DeleteDepartmentAlert";

export default async function EditDepartmentPage({
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

  const { data: potentialManagers } = await supabase
    .from("user_profiles")
    .select("user_id, full_name")
    .order("full_name");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href={`/admin/departments/${id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-3 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              Edit: <span className="text-primary">{department.name}</span>
            </h1>
          </div>
          <DeleteDepartmentAlert
            departmentId={department.id}
            departmentName={department.name}
          />
        </div>

        <DepartmentForm
          initialData={department}
          potentialManagers={potentialManagers || []}
          isEditing={true}
        />
      </div>
    </div>
  );
}
