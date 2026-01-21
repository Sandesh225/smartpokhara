// ═══════════════════════════════════════════════════════════
// app/admin/citizens/page.tsx - CITIZENS DIRECTORY
// ═══════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/server";
import { citizenQueries } from "@/lib/supabase/queries/admin/citizens";
import { Search } from "lucide-react";
import CitizensTable from "./_components/CitizensTable";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string }>;

export default async function CitizensPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { q } = await searchParams;
  const search = q || "";

  const { data } = await citizenQueries.getCitizens(supabase, search);

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tighter">
            Citizens Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage registered citizens and view their histories
          </p>
        </div>

        {/* SEARCH FORM */}
        <form className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search by email..."
            defaultValue={search}
            className="pl-10 pr-4 py-2 md:py-2.5 border border-border rounded-lg md:rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64 md:w-80 transition-all outline-none"
          />
        </form>
      </div>

      {/* TABLE */}
      <CitizensTable data={data || []} />
    </div>
  );
}
