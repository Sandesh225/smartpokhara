import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  if (!user || !isAdmin(user)) redirect("/citizen/dashboard");

  // NO UI HERE! Just pass the children through.
  // The layout UI is already rendered by app/(protected)/layout.tsx
  return <>{children}</>;
}
