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

  const [{ data: categories = [] }, { data: wards = [] }] = await Promise.all([
    supabase
      .from("complaint_categories")
      .select(
        `
        id,
        name,
        name_nepali,
        description,
        icon,
        complaint_subcategories (
          id,
          name,
          name_nepali,
          description,
          sla_days
        )
      `
      )
      .order("name", { ascending: true }),
    supabase
      .from("wards")
      .select("id, ward_number, name, name_nepali")
      .eq("is_active", true)
      .order("ward_number", { ascending: true }),
  ]);

  return <ComplaintFormWizard categories={categories} wards={wards} />;
}
