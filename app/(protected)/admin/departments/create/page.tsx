import { createClient } from "@/lib/supabase/server";
import DepartmentForm from "../_components/DepartmentForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function CreateDepartmentPage() {
  // FIX: Add 'await' here
  const supabase = await createClient();

  // Fetch all user profiles to populate the "Head of Dept" dropdown
  const { data: potentialManagers } = await supabase
    .from("user_profiles")
    .select("user_id, full_name")
    .order("full_name");

  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/departments"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Departments
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Create New Department
          </h1>
        </div>
        <DepartmentForm potentialManagers={potentialManagers || []} />
      </div>
    </div>
  );
}