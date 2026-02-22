import { Suspense } from "react";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { complaintsApi } from "@/features/complaints/api";
import { ComplaintsContent } from "./_components/ComplaintsContent";

export const dynamic = "force-dynamic";

function PageSkeleton() {
  function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} style={style} />;
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Pulse className="h-3 w-20" />
          <Pulse className="h-7 w-44" />
          <Pulse className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Pulse className="h-10 w-24 rounded-xl" />
          <Pulse className="h-10 w-36 rounded-xl" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Pulse key={i} className="h-20 rounded-xl" />)}
      </div>
      {/* Table card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Pulse className="h-[57px] rounded-none border-b border-border" />
        <div className="space-y-2 p-5">
          {[...Array(6)].map((_, i) => (
            <Pulse key={i} className="h-14 rounded-xl" style={{ opacity: 1 - i * 0.13 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUserWithRoles();
  if (!user) return null;

  const supabase = await createClient();
  const sp = await searchParams;

  const search   = typeof sp.search === "string" ? sp.search : "";
  const page     = typeof sp.page   === "string" ? Math.max(1, Number(sp.page)) : 1;
  const pageSize = 10;

  // Parallel fetch — no waterfall
  const [initialStats, initialComplaints] = await Promise.all([
    complaintsApi.getUserStats(supabase, user.id),
    complaintsApi.getUserComplaints(supabase, user.id, { search, page, pageSize }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <Suspense fallback={<PageSkeleton />}>
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