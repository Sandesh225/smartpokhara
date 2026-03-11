import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";

import { pbApi } from "@/features/participatory-budgeting";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import BudgetingContent from "./_components/BudgetingContent";

export default async function ParticipatoryBudgetingPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const cycles = await pbApi.getActiveCycles(supabase);

  return (
    <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3 shadow-sm">
              <Megaphone className="w-4 h-4 text-primary" strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Citizen Voice
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Participatory <span className="text-primary">Budgeting</span>
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-2xl">
            Empowering the citizens of Pokhara to directly decide how public funds are spent. 
            Submit ideas, vote for priorities, and track winning projects in your community.
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="h-96 flex items-center justify-center font-bold text-muted-foreground animate-pulse">Loading budget cycles...</div>}>
        <BudgetingContent cycles={cycles} />
      </Suspense>
    </main>
  );
}