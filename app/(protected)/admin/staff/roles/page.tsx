// ═══════════════════════════════════════════════════════════
// app/admin/staff/roles/page.tsx - ROLES & PERMISSIONS
// ═══════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RolesPageClient from "./RolesPageClient";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const supabase = await createClient();

  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  return <RolesPageClient roles={roles || []} />;
}
