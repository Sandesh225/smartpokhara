import { Suspense } from "react";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { complaintsApi } from "@/features/complaints/api";
import { ComplaintsContent } from "./_components/ComplaintsContent";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUserWithRoles();
  if (!user) return null;

  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  
  // Extract search and page from searchParams for initial fetch
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "";
  const page = typeof resolvedSearchParams.page === "string" ? Number(resolvedSearchParams.page) : 1;
  const pageSize = 10;

  // Initial Fetch on Server
  const [initialStats, initialComplaints] = await Promise.all([
    complaintsApi.getUserStats(supabase, user.id),
    complaintsApi.getUserComplaints(supabase, user.id, { 
      search, 
      page, 
      pageSize 
    })
  ]);

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={<PageSkeleton variant="list" />}>
          <ComplaintsContent 
            initialUserId={user.id}
            initialStats={initialStats}
            initialComplaints={initialComplaints}
          />
        </Suspense>
      </div>
    </div>
  );
}
