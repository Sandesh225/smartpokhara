import { redirect } from "next/navigation";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { enforceRole } from "@/lib/auth/require-role";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserWithRoles();
  enforceRole(user, ["admin"]);

  // NO UI HERE! Just pass the children through.
  // The layout UI is already rendered by app/(protected)/layout.tsx
  return <>{children}</>;
}
