import { createClient } from "@/lib/supabase/server";
import { citizenQueries } from "@/lib/supabase/queries/admin/citizens";

import { Search } from "lucide-react";
import CitizensTable from "./_components/CitizensTable";

export const dynamic = "force-dynamic";

// 1. Update type definition to Promise
type SearchParams = Promise<{ q?: string }>;

export default async function CitizensPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  // 2. Await the params
  const { q } = await searchParams;
  const search = q || "";

  const { data } = await citizenQueries.getCitizens(supabase, search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Citizens Directory
          </h1>
          <p className="text-gray-500">
            Manage registered citizens and view their histories.
          </p>
        </div>

        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {/* 3. Ensure defaultValue uses the resolved variable */}
          <input
            type="search"
            name="q"
            placeholder="Search by email..."
            defaultValue={search}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
          />
        </form>
      </div>

      <CitizensTable data={data || []} />
    </div>
  );
}
