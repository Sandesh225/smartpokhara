// ═══════════════════════════════════════════════════════════
// app/admin/staff/roles/page.tsx - ROLES & PERMISSIONS
// ═══════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/server";
import { RoleSelector } from "../_components/RoleSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const supabase = await createClient();

  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* BACK BUTTON */}
      <Button variant="ghost" asChild size="sm">
        <Link href="/admin/staff">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Staff
        </Link>
      </Button>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tighter">
          Roles & Permissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of system access levels and capabilities
        </p>
      </div>

      {/* ROLE SELECTOR */}
      <RoleSelector roles={roles || []} />
    </div>
  );
}
