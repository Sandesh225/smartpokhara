import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { CitizenComplaintsPage } from "@/components/citizen/citizen-complaints-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CitizenComplaintsListPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: complaints = [], error: complaintsError } = await supabase
    .from("complaints")
    .select(
      `
      id,
      tracking_code,
      title,
      status,
      priority,
      submitted_at,
      category:complaint_categories(id, name, name_nepali),
      ward:wards(id, ward_number, name, name_nepali)
    `
    )
    .eq("citizen_id", user.id)
    .order("submitted_at", { ascending: false });

  if (complaintsError) {
    console.error("Error fetching complaints:", complaintsError);
  }

  const { data: categories = [] } = await supabase
    .from("complaint_categories")
    .select("id, name, name_nepali")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const { data: wards = [] } = await supabase
    .from("wards")
    .select("id, ward_number, name, name_nepali")
    .eq("is_active", true)
    .order("ward_number", { ascending: true });

  return (
    <CitizenComplaintsPage
      complaints={complaints || []}
      categories={categories || []}
      wards={wards || []}
    />
  );
}
