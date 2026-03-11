import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { noticesApi } from "@/features/notices";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import NoticesContent from "./_components/NoticesContent";

export default async function NoticesPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Parallel fetching on the server
  const [noticesRes, unreadCount] = await Promise.all([
    noticesApi.getNotices(supabase, { 
      limit: 10, 
      page: 1,
      userId: user.id 
    }),
    noticesApi.getUnreadCount(supabase, user.id),
  ]);

  return (
    <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Official Bulletins
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Public Notices
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-2xl">
            Stay informed with official metropolitan announcements, upcoming events, 
            and critical ward updates from Pokhara Metropolitan City.
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="h-96 flex items-center justify-center font-bold text-muted-foreground animate-pulse">Loading bulletins...</div>}>
        <NoticesContent 
          initialNotices={noticesRes.data}
          initialTotal={noticesRes.count}
          initialUnreadCount={unreadCount}
        />
      </Suspense>
    </main>
  );
}