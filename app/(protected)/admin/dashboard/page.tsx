import { createClient } from "@/lib/supabase/server";
import { adminDashboardApi } from "@/features/admin-dashboard/api";
import { DashboardClient } from "./_components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  try {
    // Attempt to fetch the data
    const initialData = await adminDashboardApi.getFullDashboard(supabase);
    return <DashboardClient initialData={initialData} />;
    
  } catch (error: any) {
    // 1. Log the EXACT database error to your terminal
    console.error("🔥 Supabase SSR Error:", JSON.stringify(error, null, 2));

    // 2. Return the client component WITHOUT initialData so it can attempt a 
    // client-side fetch, or show a dedicated error state.
    // (Ensure your DashboardClient handles undefined initialData gracefully)
    return (
      <div className="p-8 text-destructive">
        <h2>Failed to load dashboard data.</h2>
        <p>Check your terminal for the exact Supabase error message.</p>
      </div>
    );
  }
}