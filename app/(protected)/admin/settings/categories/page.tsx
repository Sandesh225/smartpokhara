// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/settings/categories/page.tsx
// ═══════════════════════════════════════════════════════════

import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CategoryManager from "../_components/CategoryManager";
import { Button } from "@/components/ui/button";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [categories, departments] = await Promise.all([
    supabase.from("complaint_categories").select("*").order("display_order"),
    supabase.from("departments").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href="/admin/settings">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
              Categories & Mapping
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5">
              {categories.data?.length || 0} active categories
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <CategoryManager
        categories={categories.data || []}
        departments={departments.data || []}
      />
    </div>
  );
}
