// app/(protected)/citizen/complaints/new/page.tsx - UPDATED VERSION
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { ComplaintFormWizard } from "@/components/citizen/ComplaintFormWizard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewComplaintPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Load categories with their subcategories correctly
  const { data: categories, error: categoriesError } = await supabase
    .from("complaint_categories")
    .select(
      `
      id,
      name,
      description,
      icon,
      color,
      default_sla_days,
      complaint_subcategories!inner (
        id,
        name,
        description,
        default_sla_days,
        display_order
      )
    `
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // Load wards
  const { data: wards, error: wardsError } = await supabase
    .from("wards")
    .select("id, ward_number, name, name_nepali")
    .eq("is_active", true)
    .order("ward_number", { ascending: true });

  if (categoriesError) {
    console.error("Error loading categories:", categoriesError);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Categories
          </h2>
          <p className="text-red-700">{categoriesError.message}</p>
        </div>
      </div>
    );
  }

  if (wardsError) {
    console.error("Error loading wards:", wardsError);
    // Continue without wards - they can be optional
  }

  // Transform categories to match the expected format
  const transformedCategories =
    categories?.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description || "",
      icon: category.icon || "help-circle",
      color: category.color || "#6B7280",
      default_sla_days: category.default_sla_days || 7,
      complaint_subcategories:
        category.complaint_subcategories
          ?.map((sub) => ({
            id: sub.id,
            name: sub.name,
            description: sub.description || "",
            sla_days: sub.default_sla_days || 7,
            display_order: sub.display_order || 0,
          }))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) ||
        [],
    })) || [];

  const transformedWards =
    wards?.map((ward) => ({
      id: ward.id,
      ward_number: ward.ward_number,
      name: ward.name,
      name_nepali: ward.name_nepali || ward.name,
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Submit New Complaint
        </h1>
        <p className="text-muted-foreground">
          Report issues and concerns to help improve our city services
        </p>
      </div>
      <ComplaintFormWizard
        categories={transformedCategories}
        wards={transformedWards}
      />
    </div>
  );
}
