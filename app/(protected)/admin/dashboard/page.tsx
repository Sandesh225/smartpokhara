import { createClient } from "@/lib/supabase/server";
import { adminDashboardQueries } from "@/lib/supabase/queries/admin/dashboard";
import { DashboardClient } from "./_components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Server-side Fetch for SEO and initial load speed
  const initialData = await adminDashboardQueries.getFullDashboard(supabase);

  return <DashboardClient initialData={initialData} />;
}
