import { Suspense } from "react";
import { complaintsApi } from "@/features/complaints";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ComplaintsContent } from "./_components/ComplaintsContent";
import { LoadingState } from "./_components/SharedComponents";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;

  const filters = {
    search: typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "",
    status: typeof resolvedSearchParams.status === "string" ? [resolvedSearchParams.status] : [],
    priority: typeof resolvedSearchParams.priority === "string" ? [resolvedSearchParams.priority] : [],
    ward_id: [],
    category: [],
  };

  // Initial Data Fetching on Server
  const { data: complaints } = await complaintsApi.getJurisdictionComplaints(
    supabase,
    user.id,
    filters
  );

  const jurisdiction = {
    is_senior: true,
    node: "Pokhara-HQ-01",
    lastSync: new Date().toLocaleTimeString(),
  };

  return (
    <Suspense fallback={<LoadingState />}>
      <ComplaintsContent 
        initialUserId={user.id}
        initialComplaints={complaints || []}
        initialJurisdiction={jurisdiction}
        wards={[]} // Should be fetched from DB if available
        categories={[]} // Should be fetched from DB if available
      />
    </Suspense>
  );
}
