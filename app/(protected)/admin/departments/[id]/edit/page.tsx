import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DepartmentForm from "../../_components/DepartmentForm";
import DeleteDepartmentAlert from "../../_components/DeleteDepartmentAlert";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>; // 1. Promise Type
}) {
  const { id } = await params; // 2. Await params
  const supabase = await createClient();

  const { data: department } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id) // Use awaited id
    .single();

  if (!department) notFound();

  const { data: potentialManagers } = await supabase
    .from("user_profiles")
    .select("user_id, full_name")
    .order("full_name");

  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href={`/admin/departments/${id}`}
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Editing: <span className="text-primary">{department.name}</span>
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
