import { createClient } from "@/lib/supabase/server";
import { RoleSelector } from "../_components/RoleSelector";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const supabase = await createClient();
  
  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500">Overview of system access levels and capabilities.</p>
       </div>

       <RoleSelector roles={roles || []} />
    </div>
  );
}